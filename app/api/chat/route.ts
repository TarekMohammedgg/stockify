import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildSystemPrompt,
  type MenuItemForPrompt,
  type InsightsForPrompt,
} from "@/lib/chatbot/system-prompt";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { messages: ChatMessage[]; userId: string; customerName: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { messages, userId, customerName } = body;
  if (!Array.isArray(messages) || !userId || !customerName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const { data: menuData, error: menuError } = await supabase
    .from("v_menu")
    .select("id, name_ar, name_en, category_ar, price, is_available")
    .order("category_ar");

  if (menuError) {
    console.error("[POST /api/chat] fetch menu", menuError.message);
    return NextResponse.json({ error: "فشل تحميل القائمة" }, { status: 500 });
  }

  const { data: insightsData } = await supabase
    .from("chatbot_insights")
    .select("favourite_items")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: userData } = await supabase
    .from("users")
    .select("phone, address")
    .eq("id", userId)
    .maybeSingle();

  const menu = (menuData ?? []) as MenuItemForPrompt[];
  const insights: InsightsForPrompt = {
    favourite_items: insightsData?.favourite_items ?? null,
    phone: userData?.phone ?? null,
    address: userData?.address ?? null,
  };

  const systemPrompt = buildSystemPrompt(menu, insights, customerName);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("[POST /api/chat] OPENROUTER_API_KEY not set");
    return NextResponse.json({ error: "خطأ في الإعدادات" }, { status: 500 });
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
          messages: [{ role: "system", content: systemPrompt }, ...messages],
        }),
      },
    );

    if (!orResponse.ok) {
      const errText = await orResponse.text();
      console.error(
        "[POST /api/chat] OpenRouter error",
        orResponse.status,
        errText,
      );
      return NextResponse.json(
        { error: "فشل الاتصال بالمساعد" },
        { status: 502 },
      );
    }

    const orData = await orResponse.json();
    const reply: string =
      orData?.choices?.[0]?.message?.content ?? "عذراً، مش قادر أرد دلوقتي.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[POST /api/chat]", err);
    return NextResponse.json(
      { error: "فشل الاتصال بالمساعد" },
      { status: 500 },
    );
  }
}
