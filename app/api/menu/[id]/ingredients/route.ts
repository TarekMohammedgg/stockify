import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const [ingredientsResult, allergensResult] = await Promise.all([
    supabase
      .from("v_item_ingredients")
      .select("ingredient_id, name_ar, name_en, quantity, unit")
      .eq("menu_item_id", id),
    supabase
      .from("v_item_allergens")
      .select("allergen_id, name_ar, name_en")
      .eq("menu_item_id", id),
  ]);

  if (ingredientsResult.error) {
    console.error(
      "[GET /api/menu/[id]/ingredients]",
      id,
      ingredientsResult.error.message,
    );
    return NextResponse.json(
      { error: ingredientsResult.error.message },
      { status: 500 },
    );
  }

  if (allergensResult.error) {
    console.error(
      "[GET /api/menu/[id]/ingredients] allergens",
      id,
      allergensResult.error.message,
    );
    return NextResponse.json(
      { error: allergensResult.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ingredients: ingredientsResult.data,
    allergens: allergensResult.data,
  });
}
