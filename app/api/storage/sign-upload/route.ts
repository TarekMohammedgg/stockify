import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "restaurant-requests";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
]);

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fileName, contentType, fileSize } = body as {
    fileName?: string;
    contentType?: string;
    fileSize?: number;
  };

  if (!fileName || !contentType || typeof fileSize !== "number") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "نوع الملف غير مسموح" }, { status: 400 });
  }

  if (fileSize > MAX_SIZE) {
    return NextResponse.json(
      { error: "الحجم الأقصى للملف هو 10 ميجابايت" },
      { status: 400 }
    );
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 500 }
    );
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}/${safeName}`;

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("[sign-upload] createSignedUploadUrl error:", error?.message);
    return NextResponse.json({ error: "فشل إنشاء رابط الرفع" }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl, path });
}
