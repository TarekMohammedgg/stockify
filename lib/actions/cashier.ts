"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; ok?: true };

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

export type OrderItem = {
  menu_item_id: string;
  name_ar: string;
  name_en: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
};

export type Order = {
  id: string;
  source: "online" | "onsite";
  type: "dine-in" | "takeaway" | "delivery";
  status: OrderStatus;
  owner_name: string | null;
  delivery_address: string | null;
  notes: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: OrderItem[];
};

export type LowStockItem = {
  id: string;
  name_ar: string;
  name_en: string;
  stock_quantity: number;
  unit: string;
  low_stock_threshold: number;
  alert_level: "low" | "out_of_stock";
};

export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getOrders]", error.message);
    return [];
  }
  return (data ?? []) as Order[];
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("[updateOrderStatus]", id, error.message);
    return { error: error.message };
  }
  revalidatePath("/cashier");
  return { ok: true };
}

export async function getLowStock(): Promise<LowStockItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_low_stock")
    .select("*")
    .order("alert_level", { ascending: true });
  if (error) {
    console.error("[getLowStock]", error.message);
    return [];
  }
  return (data ?? []) as LowStockItem[];
}

export type CreateOrderData = {
  type: "dine-in" | "takeaway";
  owner_name?: string;
  notes?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    notes?: string;
  }[];
};

export async function createOnsiteOrder(
  data: CreateOrderData,
): Promise<ActionResult & { orderId?: string }> {
  const supabase = await createClient();

  if (!data.items.length) return { error: "أضف صنفاً واحداً على الأقل" };
  if (data.type === "takeaway" && !data.owner_name?.trim())
    return { error: "أدخل اسم صاحب الطلب للتيك أواي" };

  const total_price = data.items.reduce(
    (sum, i) => sum + i.unit_price * i.quantity,
    0,
  );

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      source: "onsite",
      type: data.type,
      status: "pending",
      owner_name: data.owner_name?.trim() || null,
      notes: data.notes?.trim() || null,
      total_price,
    })
    .select("id")
    .single();

  if (orderErr) {
    console.error("[createOnsiteOrder] insert order", orderErr.message);
    return { error: orderErr.message };
  }

  const { error: itemsErr } = await supabase.from("order_items").insert(
    data.items.map((i) => ({
      order_id: order.id,
      menu_item_id: i.menu_item_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
      notes: i.notes?.trim() || null,
    })),
  );

  if (itemsErr) {
    console.error("[createOnsiteOrder] insert items", itemsErr.message);
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: itemsErr.message };
  }

  revalidatePath("/cashier");
  return { ok: true, orderId: order.id };
}
