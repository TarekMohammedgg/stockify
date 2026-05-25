"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = { error?: string; ok?: true };

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

export async function createCashier(formData: FormData): Promise<ActionResult> {
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
  });
  if (error) return { error: error.message };
  if (!data.user) return { error: "تعذّر إنشاء الحساب" };

  const { error: profileErr } = await admin
    .from("users")
    .update({ role: "cashier", phone, name, profile_complete: true })
    .eq("id", data.user.id);
  if (profileErr) return { error: profileErr.message };

  revalidatePath("/admin/employees");
  return { ok: true };
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
