import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_menu")
    .select(
      "id, name_ar, name_en, category_ar, category_en, price, photo_url, is_available",
    );

  if (error) {
    console.error("[GET /api/menu]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
