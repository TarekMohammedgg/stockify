"use server";

import { createClient } from "@supabase/supabase-js";

const VALID_ADDONS = new Set(["chatbot", "whatsapp", "mobile_app"]);

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface SiteRequestPayload {
  email: string;
  websiteName: string;
  specs: string;
  menuPdfPath: string;
  logoPaths: string[];
  addons: string[];
  notes: string;
}

export async function submitSiteRequest(
  payload: SiteRequestPayload
): Promise<{ ok?: true; error?: string }> {
  const { email, websiteName, specs, menuPdfPath, logoPaths, addons, notes } =
    payload;

  // Server-side validation
  if (!email || !email.includes("@")) {
    return { error: "بريد إلكتروني غير صالح" };
  }
  if (!websiteName.trim() || websiteName.length > 200) {
    return { error: "اسم الموقع مطلوب (200 حرف كحد أقصى)" };
  }
  if (!specs.trim() || specs.length > 5000) {
    return { error: "مواصفات الموقع مطلوبة (5000 حرف كحد أقصى)" };
  }
  if (!menuPdfPath.trim()) {
    return { error: "يجب رفع ملف المنيو" };
  }
  if (logoPaths.length > 5) {
    return { error: "يمكن رفع 5 ملفات كحد أقصى للوجو" };
  }
  const invalidAddon = addons.find((a) => !VALID_ADDONS.has(a));
  if (invalidAddon) {
    return { error: "إضافة غير صالحة" };
  }
  if (notes.length > 2000) {
    return { error: "الملاحظات تتجاوز 2000 حرف" };
  }

  const admin = getAdminClient();
  if (!admin) {
    return { error: "الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً" };
  }

  const { error } = await admin.from("restaurant_requests").insert({
    email: email.trim().toLowerCase(),
    website_name: websiteName.trim(),
    specs: specs.trim(),
    menu_pdf_path: menuPdfPath,
    logo_paths: logoPaths,
    addons,
    notes: notes.trim() || null,
  });

  if (error) {
    console.error("[submitSiteRequest] insert error:", error.message);
    return { error: "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى" };
  }

  return { ok: true };
}
