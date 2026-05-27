import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { messages: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { messages } = body;
  const userId = user.id; // always use authenticated session — never trust body userId
  if (!Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const systemPrompt = `أنت مساعد لتحليل المحادثات. استخرج فقط المعلومات الصريحة المذكورة:

1. address: عنوان التوصيل (اسم شارع/منطقة/حي/مدينة/رقم عمارة). نص أو null. **يجب ألا يكون رقم تليفون.**
2. phone: رقم تليفون مصري (يبدأ بـ 01 أو +20، طوله 10-13 رقم، أرقام فقط بدون كلمات). نص أو null.
3. favourite_items: مصفوفة نصوص لأسماء الأصناف اللي العميل طلبها أو أعجب بيها، مع ملاحظاته عليها (مثل "شاورما طاووق من غير طماطم"). مصفوفة نصوص أو [].

أمثلة:
- "عنواني المعادي شارع 9" → address: "المعادي شارع 9", phone: null
- "تليفوني 01007362202" → address: null, phone: "01007362202"
- "01234567890" بدون كلمة عنوان → phone، مش address.
- "طلبت شاورما طاووق من غير طماطم" → favourite_items: ["شاورما طاووق من غير طماطم"]

الرد JSON فقط بهذا الهيكل بالضبط:
{"address": null, "phone": null, "favourite_items": []}`;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenRouter API Key not configured" }, { status: 500 });
  }

  try {
    const orResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://stockify.vercel.app",
          "X-Title": "Stockify Chatbot",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: systemPrompt }, ...messages],
        }),
      },
    );

    if (!orResponse.ok) {
      console.error("[POST /api/chat/extract-insights] OpenRouter error", await orResponse.text());
      return NextResponse.json({ error: "Failed to extract insights" }, { status: 502 });
    }

    const orData = await orResponse.json();
    let reply = orData?.choices?.[0]?.message?.content || "{}";
    
    // Strip markdown formatting if any
    reply = reply.replace(/```json/g, "").replace(/```/g, "").trim();

    let insights: { address?: string | null; phone?: string | null; favourite_items?: string[] };
    try {
      insights = JSON.parse(reply);
    } catch {
      console.error("[POST /api/chat/extract-insights] parse failed", reply.slice(0, 200));
      return NextResponse.json({ success: false, reason: "parse" }, { status: 200 });
    }

    // Guard: if "address" is actually a phone number, reclassify.
    const phoneLike = /^\+?\d[\d\s-]{7,14}$/;
    if (insights.address && phoneLike.test(insights.address.trim())) {
      if (!insights.phone) insights.phone = insights.address.trim();
      insights.address = null;
    }
    // Guard: phone must be mostly digits.
    if (insights.phone && !phoneLike.test(insights.phone.trim())) {
      insights.phone = null;
    }

    // Backfill users.phone / users.address only when currently empty —
    // don't silently overwrite a value the user set manually in their
    // profile. Explicit profile edits live in /complete-profile.
    if (insights.phone || insights.address) {
      const { data: currentUser } = await supabase
        .from("users")
        .select("phone, address")
        .eq("id", userId)
        .maybeSingle();

      const updatesToUser: { phone?: string; address?: string } = {};
      if (insights.phone && !currentUser?.phone) updatesToUser.phone = insights.phone;
      if (insights.address && !currentUser?.address) updatesToUser.address = insights.address;

      if (Object.keys(updatesToUser).length > 0) {
        const { error: userUpdateError } = await supabase
          .from("users")
          .update(updatesToUser)
          .eq("id", userId);
        if (userUpdateError) {
          console.error(
            "[POST /api/chat/extract-insights] update users",
            userId,
            userUpdateError.message,
          );
        }
      }
    }

    // Update users_insights: append favourite_items, save user_phone, user_address
    const insightsUpsert: Record<string, unknown> = {
      user_id: userId,
      last_seen: new Date().toISOString(),
    };

    if (insights.phone) insightsUpsert.user_phone = insights.phone;
    if (insights.address && !phoneLike.test(insights.address.trim())) {
      insightsUpsert.user_address = insights.address;
    }

    if (Array.isArray(insights.favourite_items) && insights.favourite_items.length > 0) {
      const { data: existingInsights } = await supabase
        .from("users_insights")
        .select("favourite_items")
        .eq("user_id", userId)
        .maybeSingle();

      const existing: string[] = existingInsights?.favourite_items ?? [];
      const merged = [...existing];
      for (const item of insights.favourite_items) {
        if (!merged.includes(item)) merged.push(item);
      }
      insightsUpsert.favourite_items = merged;
    }

    await supabase
      .from("users_insights")
      .upsert(insightsUpsert, { onConflict: "user_id" });

    return NextResponse.json({ success: true, insights });
  } catch (err) {
    console.error("[POST /api/chat/extract-insights]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
