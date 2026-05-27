"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/actions/cashier";

type ActionResult = { error?: string; ok?: true };

// ───────────────────────────────────────────────────────────────
// ORDERS (admin — full permissions)
// ───────────────────────────────────────────────────────────────

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "on_delivery",
  "complete",
  "cancelled",
];

export async function listAllOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listAllOrders]", error.message);
    throw new Error(error.message);
  }
  return (data ?? []) as Order[];
}

export async function updateOrderStatusAdmin(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  if (!VALID_ORDER_STATUSES.includes(status)) {
    console.error("[updateOrderStatusAdmin] invalid status", id, status);
    return { error: "حالة غير صالحة" };
  }

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[updateOrderStatusAdmin]", id, error.message);
    return { error: error.message };
  }
  if (!updated) {
    console.error("[updateOrderStatusAdmin] 0 rows updated (RLS?)", id);
    return { error: "تعذّر تحديث الطلب — تحقق من الصلاحيات" };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

// ───────────────────────────────────────────────────────────────
// CUSTOMERS (admin view — profile + insights + order summary)
// ───────────────────────────────────────────────────────────────

export type CustomerInsight = {
  user_address: string | null;
  favourite_items: string[];
  favourite_item_names: string[];
  last_seen: string | null;
};

export type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  auth_provider: string;
  is_active: boolean;
  created_at: string;
  insights: CustomerInsight | null;
  order_count: number;
  last_order_at: string | null;
  last_order_status: string | null;
  total_spend: number;
};

export async function listCustomers(): Promise<CustomerRow[]> {
  const supabase = await createClient();

  const [usersRes, insightsRes, ordersRes] = await Promise.all([
    supabase
      .from("users")
      .select(
        "id, name, phone, email, address, auth_provider, is_active, created_at",
      )
      .eq("role", "customer"),
    supabase
      .from("users_insights")
      .select("user_id, favourite_items, user_address, last_seen"),
    supabase
      .from("orders")
      .select("customer_id, status, total_price, created_at")
      .not("customer_id", "is", null),
  ]);

  if (usersRes.error) {
    console.error("[listCustomers] users", usersRes.error.message);
    throw new Error(usersRes.error.message);
  }

  const insightsByUser = new Map<
    string,
    {
      favourite_items: string[];
      user_address: string | null;
      last_seen: string | null;
    }
  >();
  for (const row of insightsRes.data ?? []) {
    insightsByUser.set(row.user_id, {
      favourite_items: (row.favourite_items ?? []) as string[],
      user_address: row.user_address,
      last_seen: row.last_seen,
    });
  }

  // Aggregate orders per customer
  type Agg = { count: number; last_at: string | null; last_status: string | null; spend: number };
  const orderAgg = new Map<string, Agg>();
  for (const o of ordersRes.data ?? []) {
    if (!o.customer_id) continue;
    const cur = orderAgg.get(o.customer_id) ?? {
      count: 0,
      last_at: null,
      last_status: null,
      spend: 0,
    };
    cur.count += 1;
    if (o.status === "complete") cur.spend += Number(o.total_price ?? 0);
    if (!cur.last_at || new Date(o.created_at) > new Date(cur.last_at)) {
      cur.last_at = o.created_at;
      cur.last_status = o.status;
    }
    orderAgg.set(o.customer_id, cur);
  }

  const rows: CustomerRow[] = (usersRes.data ?? []).map((u) => {
    const ins = insightsByUser.get(u.id) ?? null;
    const agg = orderAgg.get(u.id);
    return {
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      address: u.address,
      auth_provider: u.auth_provider,
      is_active: u.is_active,
      created_at: u.created_at,
      insights: ins
        ? {
            user_address: ins.user_address,
            favourite_items: ins.favourite_items,
            favourite_item_names: ins.favourite_items,
            last_seen: ins.last_seen,
          }
        : null,
      order_count: agg?.count ?? 0,
      last_order_at: agg?.last_at ?? null,
      last_order_status: agg?.last_status ?? null,
      total_spend: agg?.spend ?? 0,
    };
  });

  rows.sort((a, b) => {
    if (a.last_order_at && b.last_order_at)
      return (
        new Date(b.last_order_at).getTime() -
        new Date(a.last_order_at).getTime()
      );
    if (a.last_order_at) return -1;
    if (b.last_order_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return rows;
}

// ───────────────────────────────────────────────────────────────
// MENU ITEMS
// ───────────────────────────────────────────────────────────────

function parseUuidList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || value.length === 0) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseIngredientList(
  value: FormDataEntryValue | null,
): { ingredient_id: string; quantity: number }[] {
  if (typeof value !== "string" || value.length === 0) return [];
  try {
    const parsed = JSON.parse(value) as { id: string; quantity: number }[];
    return parsed
      .filter((p) => p.id && Number.isFinite(p.quantity) && p.quantity > 0)
      .map((p) => ({ ingredient_id: p.id, quantity: Number(p.quantity) }));
  } catch {
    return [];
  }
}

export async function saveMenuItem(
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const name_ar = String(formData.get("name_ar") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim();
  const category_id = String(formData.get("category_id") ?? "").trim();
  const price = Number(formData.get("price"));
  const photo_url = String(formData.get("photo_url") ?? "").trim() || null;
  const is_available = formData.get("is_available") === "on";
  const allergen_ids = parseUuidList(formData.get("allergen_ids"));
  const ingredients = parseIngredientList(formData.get("ingredients"));

  if (!name_ar || !name_en) return { error: "الاسم بالعربية والإنجليزية مطلوب" };
  if (!category_id) return { error: "اختر تصنيفاً" };
  if (!Number.isFinite(price) || price < 0) return { error: "السعر غير صحيح" };

  let menuItemId = id;

  if (id) {
    const { error } = await supabase
      .from("menu_items")
      .update({ name_ar, name_en, category_id, price, photo_url, is_available })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({ name_ar, name_en, category_id, price, photo_url, is_available })
      .select("id")
      .single();
    if (error) return { error: error.message };
    menuItemId = data.id;
  }

  if (!menuItemId) return { error: "فشل حفظ الصنف" };

  // Replace junctions
  await supabase.from("menu_item_allergens").delete().eq("menu_item_id", menuItemId);
  await supabase.from("menu_item_ingredients").delete().eq("menu_item_id", menuItemId);

  if (allergen_ids.length > 0) {
    const { error } = await supabase.from("menu_item_allergens").insert(
      allergen_ids.map((aid) => ({ menu_item_id: menuItemId!, allergen_id: aid })),
    );
    if (error) return { error: error.message };
  }
  if (ingredients.length > 0) {
    const { error } = await supabase.from("menu_item_ingredients").insert(
      ingredients.map((i) => ({ menu_item_id: menuItemId!, ...i })),
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/menu");
  revalidatePath("/admin");
  redirect("/admin/menu");
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/menu");
  return { ok: true };
}

export async function toggleMenuItemAvailability(
  id: string,
  next: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/menu");
  return { ok: true };
}

// ───────────────────────────────────────────────────────────────
// INGREDIENTS
// ───────────────────────────────────────────────────────────────

export async function saveIngredient(
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const name_ar = String(formData.get("name_ar") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim();
  const stock_quantity = Number(formData.get("stock_quantity"));
  const unit = String(formData.get("unit") ?? "piece") as
    | "kg"
    | "liter"
    | "piece"
    | "gram"
    | "ml";
  const low_stock_threshold = Number(formData.get("low_stock_threshold"));

  if (!name_ar || !name_en) return { error: "الاسم بالعربية والإنجليزية مطلوب" };
  if (!Number.isFinite(stock_quantity) || stock_quantity < 0)
    return { error: "الكمية غير صحيحة" };
  if (!Number.isFinite(low_stock_threshold) || low_stock_threshold < 0)
    return { error: "حد التنبيه غير صحيح" };

  if (id) {
    const { error } = await supabase
      .from("ingredients")
      .update({ name_ar, name_en, stock_quantity, unit, low_stock_threshold })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("ingredients").insert({
      name_ar,
      name_en,
      stock_quantity,
      unit,
      low_stock_threshold,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/ingredients");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteIngredient(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/ingredients");
  return { ok: true };
}

// ───────────────────────────────────────────────────────────────
// EMPLOYEES (cashiers)
// ───────────────────────────────────────────────────────────────

import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function createEmployee(
  formData: FormData,
  role: "cashier" | "delivery",
): Promise<ActionResult> {
  const admin = getAdminClient();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY غير مضبوط في البيئة" };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 6)
    return { error: "أكمل البيانات (كلمة السر 6 أحرف على الأقل)" };

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
    app_metadata: { role },
  });
  if (error) {
    console.error("[createEmployee] auth.admin.createUser failed", error.message);
    return { error: error.message };
  }
  if (!data.user) return { error: "تعذّر إنشاء الحساب" };

  const { error: profileErr } = await admin
    .from("users")
    .update({ role, phone, name, profile_complete: true })
    .eq("id", data.user.id);
  if (profileErr) {
    console.error("[createEmployee] users update failed", profileErr.message);
    return { error: profileErr.message };
  }

  revalidatePath("/admin/employees");
  return { ok: true };
}

export async function createCashier(formData: FormData): Promise<ActionResult> {
  return createEmployee(formData, "cashier");
}

export async function createDeliveryEmployee(
  formData: FormData,
): Promise<ActionResult> {
  return createEmployee(formData, "delivery");
}

export async function updateCashier(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  if (!name) return { error: "الاسم مطلوب" };

  const { error } = await supabase
    .from("users")
    .update({ name, phone })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/employees");
  return { ok: true };
}

export async function setCashierActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ is_active: active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/employees");
  return { ok: true };
}

export async function deleteCashier(id: string): Promise<ActionResult> {
  const admin = getAdminClient();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY غير مضبوط في البيئة" };
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };
  revalidatePath("/admin/employees");
  return { ok: true };
}
