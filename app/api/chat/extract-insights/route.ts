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

  const { data: menuData } = await supabase
    .from("v_menu")
    .select("id, name_ar")
    .eq("is_available", true);

  const menuText = (menuData ?? [])
    .map((item) => `- ${item.name_ar} (ID: ${item.id})`)
    .join("\n");

  const systemPrompt = `أنت مساعد لتحليل المحادثات. استخرج فقط المعلومات الصريحة المذكورة:

1. address: عنوان التوصيل (اسم شارع/منطقة/حي/مدينة/رقم عمارة). نص أو null. **يجب ألا يكون رقم تليفون.**
2. phone: رقم تليفون مصري (يبدأ بـ 01 أو +20، طوله 10-13 رقم، أرقام فقط بدون كلمات). نص أو null.
3. favourite_items: مصفوفة IDs للأصناف اللي العميل طلبها أو أعجب بيها. مصفوفة نصوص أو [].

قائمة الأصناف للربط:
${menuText}

أمثلة:
- "عنواني المعادي شارع 9" → address: "المعادي شارع 9", phone: null
- "تليفوني 01007362202" → address: null, phone: "01007362202"
- "01234567890" بدون كلمة عنوان → phone، مش address.

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

    // Update users table for phone and address if present
    const updatesToUser: { phone?: string; address?: string } = {};
    if (insights.phone) updatesToUser.phone = insights.phone;
    if (insights.address) updatesToUser.address = insights.address;

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

    // Update chatbot_insights for favourite_items
    // Append to existing or create new
    if (Array.isArray(insights.favourite_items) && insights.favourite_items.length > 0) {
      const { data: existingInsights } = await supabase
        .from("chatbot_insights")
        .select("id, favourite_items")
        .eq("user_id", userId)
        .maybeSingle();

      let newFavourites = existingInsights?.favourite_items || [];
      let added = false;
      
      // add new items without duplicates
      for (const item of insights.favourite_items) {
        if (!newFavourites.includes(item)) {
          newFavourites.push(item);
          added = true;
        }
      }

      if (added) {
        if (existingInsights) {
          await supabase
            .from("chatbot_insights")
            .update({ favourite_items: newFavourites })
            .eq("user_id", userId);
        } else {
          await supabase
            .from("chatbot_insights")
            .insert({ user_id: userId, favourite_items: newFavourites });
        }
      }
    }

    // Also save default_address if address was extracted (and is not a phone)
    if (insights.address && !phoneLike.test(insights.address.trim())) {
      await supabase
        .from("chatbot_insights")
        .upsert(
          {
            user_id: userId,
            default_address: insights.address,
            last_seen: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
    }

    return NextResponse.json({ success: true, insights });
  } catch (err) {
    console.error("[POST /api/chat/extract-insights]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
