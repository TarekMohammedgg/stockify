import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/orders]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

interface CreateOrderBody {
  type: "takeaway" | "delivery";
  customer_id?: string;
  owner_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  notes?: string;
  items: OrderItem[];
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateOrderBody;
  const {
    type,
    customer_id,
    owner_name,
    customer_phone,
    delivery_address,
    notes,
    items,
  } = body;

  if (!items || items.length === 0) {
    return NextResponse.json(
      { error: "items must not be empty" },
      { status: 400 },
    );
  }

  if (type === "delivery" && !delivery_address) {
    return NextResponse.json(
      { error: "delivery_address is required for delivery orders" },
      { status: 400 },
    );
  }

  const total_price = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      source: "online",
      type,
      status: "pending",
      customer_id: customer_id ?? null,
      owner_name: owner_name ?? null,
      customer_phone: customer_phone ?? null,
      delivery_address: delivery_address ?? null,
      notes: notes ?? null,
      total_price,
    })
    .select("id")
    .single();

  if (orderError) {
    console.error("[POST /api/orders] insert order", orderError.message);
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    notes: item.notes ?? null,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("[POST /api/orders] insert items", order.id, itemsError.message);
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
