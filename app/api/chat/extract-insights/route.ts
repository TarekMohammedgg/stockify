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

  const systemPrompt = `أنت مساعد لتحليل المحادثات. استخرج المعلومات التالية من المحادثة إذا تم ذكرها:
1. address: عنوان التوصيل للعميل (نص أو null إذا لم يذكر).
2. phone: رقم تليفون العميل (نص أو null إذا لم يذكر).
3. favourite_items: مصفوفة تحتوي على معرفات (IDs) الأصناف اللي العميل طلبها أو عبر عن إعجابه بيها (مصفوفة نصوص أو []).

استخدم قائمة الأصناف التالية لربط أسماء الأكل المذكورة في المحادثة بالـ ID الخاص بيها:
${menuText}

يجب أن يكون الرد عبارة عن JSON فقط بدون أي نص إضافي، وبنفس الهيكل التالي:
{
  "address": "...",
  "phone": "...",
  "favourite_items": ["id1", "id2"]
}`;

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

    let insights;
    try {
      insights = JSON.parse(reply);
    } catch (err) {
      console.error("Failed to parse insights JSON", reply);
      return NextResponse.json({ error: "Invalid insights format" }, { status: 500 });
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

    // Also save default_address if address was extracted
    if (insights.address) {
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
