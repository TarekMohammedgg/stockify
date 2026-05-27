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

  const { messages, customerName } = body;
  const userId = user.id; // always use authenticated session — never trust body userId
  if (!Array.isArray(messages) || !customerName) {
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
    .from("users_insights")
    .select("favourite_items, user_address, user_phone, last_seen")
    .eq("user_id", userId)
    .maybeSingle();

  const menu = (menuData ?? []) as MenuItemForPrompt[];
  const insights: InsightsForPrompt = {
    favourite_items: insightsData?.favourite_items ?? null,
    user_phone: insightsData?.user_phone ?? null,
    user_address: insightsData?.user_address ?? null,
    last_seen: insightsData?.last_seen ?? null,
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

    const CONFIRMATION_PHRASES = ["جاري تسجيل طلبك", "تم تسجيل طلبك", "ORDER_CONFIRMED"];
    const isOrderConfirmed =
      reply.includes("<<ORDER_CONFIRMED>>") ||
      CONFIRMATION_PHRASES.some((p) => reply.includes(p));
    const cleanReply = reply.replaceAll("<<ORDER_CONFIRMED>>", "").trim();

    if (!isOrderConfirmed) {
      return NextResponse.json({ reply: cleanReply });
    }

    // Order confirmed — extract structured data and submit
    try {
      // Use item names (not UUIDs) to avoid hallucination; backend maps names → real IDs
      const menuNamesForExtraction = menu
        .filter((item) => item.is_available)
        .map((item) => `- ${item.name_ar} (${item.price} جنيه)`)
        .join("\n");

      const extractionSystemPrompt = `أنت نظام استخراج بيانات. استخرج تفاصيل الطلب المؤكد من المحادثة كـ JSON فقط بدون أي نص إضافي.

قائمة الأصناف المتاحة:
${menuNamesForExtraction}

أعطني JSON بهذا الهيكل فقط:
{"type":"delivery or takeaway","items":[{"name":"اسم الصنف بالضبط","quantity":1,"notes":null}],"delivery_address":null,"customer_phone":null,"notes":null}

قواعد:
- name يجب أن يكون اسم الصنف بالضبط كما هو في القائمة أعلاه
- delivery_address مطلوب لو type هو delivery`;

      const extractResponse = await fetch(
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
            max_tokens: 512,
            messages: [
              { role: "system", content: extractionSystemPrompt },
              ...messages.slice(-10),
            ],
          }),
        },
      );

      if (!extractResponse.ok) {
        const errText = await extractResponse.text();
        console.error(
          "[POST /api/chat] extraction OpenRouter error",
          extractResponse.status,
          errText,
        );
        return NextResponse.json({
          reply: cleanReply + "\n\nعذراً، حصل مشكلة في تسجيل الطلب. حاول تاني.",
        });
      }

      const extractData = await extractResponse.json();
      const extractedContent: string =
        extractData?.choices?.[0]?.message?.content ?? "{}";

      const rawJson = extractedContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let orderData: any;
      try {
        orderData = JSON.parse(rawJson);
      } catch (parseErr) {
        console.error("[POST /api/chat] extraction JSON parse failed", parseErr, "raw:", rawJson.slice(0, 300));
        throw parseErr;
      }

      if (!["delivery", "takeaway"].includes(orderData.type)) {
        throw new Error(`Invalid order type from extraction: ${orderData.type}`);
      }
      if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error("No valid items in extracted order");
      }

      // Map item names → real menu IDs and prices
      type ExtractedItem = { name: string; quantity: number; notes: string | null };
      const resolvedItems = (orderData.items as ExtractedItem[])
        .map((item) => {
          const found = menu.find(
            (m) => m.name_ar === item.name || m.name_en === item.name,
          );
          if (!found) {
            console.error("[POST /api/chat] unmatched item name:", item.name);
            return null;
          }
          return {
            menu_item_id: found.id,
            quantity: item.quantity ?? 1,
            unit_price: found.price,
            notes: item.notes ?? null,
          };
        })
        .filter(Boolean) as Array<{ menu_item_id: string; quantity: number; unit_price: number; notes: string | null }>;

      if (resolvedItems.length === 0) {
        throw new Error("No menu items could be matched from extraction");
      }

      const totalPrice = resolvedItems.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0,
      );

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          source: "online",
          type: orderData.type,
          status: "pending",
          customer_id: userId,
          owner_name: customerName,
          customer_phone: orderData.customer_phone ?? null,
          delivery_address: orderData.delivery_address ?? null,
          notes: orderData.notes ?? null,
          total_price: totalPrice,
        })
        .select("id")
        .single();

      if (orderError) {
        console.error("[POST /api/chat] insert order", orderError.message);
        return NextResponse.json({
          reply: cleanReply + "\n\nعذراً، حصل مشكلة في تسجيل الطلب. حاول تاني.",
        });
      }

      const orderItems = resolvedItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error(
          "[POST /api/chat] insert order items",
          order.id,
          itemsError.message,
        );
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json({
          reply: cleanReply + "\n\nعذراً، حصل مشكلة في تسجيل الطلب. حاول تاني.",
        });
      }

      const orderedItemNames = resolvedItems.map(
        (item) => menu.find((m) => m.id === item.menu_item_id)?.name_ar ?? item.menu_item_id,
      );
      const deliveryAddress: string | null = orderData.delivery_address ?? null;
      const customerPhone: string | null = orderData.customer_phone ?? null;

      await supabase.from("users_insights").upsert(
        {
          user_id: userId,
          favourite_items: orderedItemNames,
          ...(deliveryAddress && { user_address: deliveryAddress }),
          ...(customerPhone && { user_phone: customerPhone }),
          last_seen: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      return NextResponse.json({ reply: cleanReply, orderId: order.id });
    } catch (extractErr) {
      console.error("[POST /api/chat] order extraction failed", extractErr);
      return NextResponse.json({
        reply: cleanReply + "\n\nعذراً، حصل مشكلة في تسجيل الطلب. حاول تاني.",
      });
    }
  } catch (err) {
    console.error("[POST /api/chat]", err);
    return NextResponse.json(
      { error: "فشل الاتصال بالمساعد" },
      { status: 500 },
    );
  }
}
