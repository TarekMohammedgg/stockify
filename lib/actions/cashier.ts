"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; ok?: true };

export type OrderStatus = "pending" | "on_delivery" | "complete" | "cancelled";

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

const CASHIER_ALLOWED_STATUSES: OrderStatus[] = ["complete", "cancelled"];

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  // Guard: only allow complete or cancelled transitions for cashier
  if (!CASHIER_ALLOWED_STATUSES.includes(status)) {
    console.error(
      "[updateOrderStatus] invalid status transition attempted",
      id,
      status,
    );
    return { error: "انتقال حالة غير مسموح به" };
  }

  const supabase = await createClient();

  // Guard: fetch order type before mutating
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("type")
    .eq("id", id)
    .single();

  if (fetchErr || !order) {
    console.error(
      "[updateOrderStatus] fetch",
      id,
      fetchErr?.message ?? "not found",
    );
    return { error: "الطلب غير موجود" };
  }

  if (order.type === "delivery") {
    console.error(
      "[updateOrderStatus] cashier attempted to mutate delivery order",
      id,
    );
    return { error: "لا يمكن للكاشير تغيير حالة طلبات التوصيل" };
  }

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

export type CustomerInfo = {
  id: string;
  name: string;
  phone: string;
  address: string | null;
};

export async function findCustomerByPhone(
  phone: string,
): Promise<{ customer?: CustomerInfo; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, phone, address")
    .eq("phone", phone.trim())
    .eq("role", "customer")
    .maybeSingle();
  if (error) {
    console.error("[findCustomerByPhone]", phone, error.message);
    return { error: "خطأ في البحث، حاول مرة أخرى" };
  }
  if (!data) return { error: "لم يتم العثور على عميل بهذا الرقم" };
  return { customer: data as CustomerInfo };
}

export type CreateOrderData = {
  type: "dine-in" | "takeaway" | "delivery";
  customer_id?: string;
  owner_name?: string;
  customer_phone?: string;
  delivery_address?: string;
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
  if (data.type === "delivery") {
    if (!data.owner_name?.trim()) return { error: "أدخل اسم العميل للتوصيل" };
    if (!data.delivery_address?.trim()) return { error: "أدخل عنوان التوصيل" };
  }

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
      customer_id: data.customer_id ?? null,
      owner_name: data.owner_name?.trim() || null,
      customer_phone: data.customer_phone?.trim() || null,
      delivery_address: data.delivery_address?.trim() || null,
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
