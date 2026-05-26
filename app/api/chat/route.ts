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
    .from("chatbot_insights")
    .select("favourite_items, default_address")
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
    default_address: insightsData?.default_address ?? null,
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

    const isOrderConfirmed = reply.includes("<<ORDER_CONFIRMED>>");
    const cleanReply = reply.replaceAll("<<ORDER_CONFIRMED>>", "").trim();

    if (!isOrderConfirmed) {
      return NextResponse.json({ reply: cleanReply });
    }

    // Order confirmed — extract structured data and submit
    try {
      const menuListForExtraction = menu
        .filter((item) => item.is_available)
        .map(
          (item) =>
            `${item.name_ar} → ID: ${item.id} | السعر: ${item.price}`,
        )
        .join("\n");

      const extractionSystemPrompt = `أنت نظام استخراج بيانات. استخرج تفاصيل الطلب المؤكد من المحادثة التالية كـ JSON فقط بدون أي نص إضافي.

قائمة الأصناف المتاحة (استخدم الـ ID بالضبط):
${menuListForExtraction}

أعطني JSON بهذا الهيكل فقط:
{
  "type": "delivery" أو "takeaway",
  "items": [{"menu_item_id": "UUID_هنا", "quantity": 1, "unit_price": 45.00, "notes": null}],
  "delivery_address": "نص أو null",
  "customer_phone": "نص أو null",
  "notes": null
}

قواعد:
- استخدم UUIDs بالضبط من القائمة أعلاه
- unit_price يجب أن يكون نفس السعر في القائمة
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
      const orderData = JSON.parse(rawJson);

      if (!["delivery", "takeaway"].includes(orderData.type)) {
        throw new Error(`Invalid order type from extraction: ${orderData.type}`);
      }
      if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error("No valid items in extracted order");
      }

      const totalPrice = (orderData.items as Array<{ unit_price: number; quantity: number }>).reduce(
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

      const orderItems = (orderData.items as Array<{ menu_item_id: string; quantity: number; unit_price: number; notes: string | null }>).map(
        (item) => ({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes ?? null,
        }),
      );

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

      const orderedItemIds = (orderData.items as Array<{ menu_item_id: string }>)
        .map((item) => item.menu_item_id)
        .filter(Boolean);
      const deliveryAddress: string | null = orderData.delivery_address ?? null;

      await supabase.from("chatbot_insights").upsert(
        {
          user_id: userId,
          favourite_items: orderedItemIds,
          ...(deliveryAddress && { default_address: deliveryAddress }),
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
