"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type DeliveryStatus = "pending" | "on_delivery" | "complete" | "cancelled";

export type OrderItem = {
  menu_item_id: string;
  name_ar: string;
  name_en: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
};

export type DeliveryOrder = {
  id: string;
  source: "online" | "onsite";
  type: "delivery";
  status: DeliveryStatus;
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

type ActionResult = { error?: string; ok?: true };

// Valid transitions: pending→on_delivery, pending→cancelled,
// on_delivery→complete, on_delivery→cancelled
const VALID_TRANSITIONS: Partial<Record<DeliveryStatus, DeliveryStatus[]>> = {
  pending:     ["on_delivery", "cancelled"],
  on_delivery: ["complete", "cancelled"],
};

export async function listDeliveryOrders(): Promise<DeliveryOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_orders")
    .select("*")
    .eq("type", "delivery")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listDeliveryOrders]", error.message);
    return [];
  }

  return (data ?? []) as DeliveryOrder[];
}

export async function updateDeliveryOrderStatus(
  orderId: string,
  status: DeliveryStatus,
): Promise<ActionResult> {
  const supabase = await createClient();

  // Fetch the current order to validate type and current status
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("type, status")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) {
    console.error(
      "[updateDeliveryOrderStatus] fetch",
      orderId,
      fetchErr?.message ?? "not found",
    );
    return { error: "الطلب غير موجود" };
  }

  if (order.type !== "delivery") {
    console.error(
      "[updateDeliveryOrderStatus] order is not a delivery type",
      orderId,
      order.type,
    );
    return { error: "هذا الطلب ليس طلب توصيل" };
  }

  const currentStatus = order.status as DeliveryStatus;

  if (currentStatus === "complete" || currentStatus === "cancelled") {
    console.error(
      "[updateDeliveryOrderStatus] attempted to mutate terminal order",
      orderId,
      currentStatus,
    );
    return { error: "لا يمكن تغيير حالة طلب منتهٍ" };
  }

  const allowedNext = VALID_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext.includes(status)) {
    console.error(
      "[updateDeliveryOrderStatus] invalid transition",
      orderId,
      currentStatus,
      "→",
      status,
    );
    return { error: "انتقال حالة غير مسموح به" };
  }

  const { error: updateErr } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (updateErr) {
    console.error(
      "[updateDeliveryOrderStatus] update",
      orderId,
      updateErr.message,
    );
    return { error: updateErr.message };
  }

  revalidatePath("/delivery");
  return { ok: true };
}
