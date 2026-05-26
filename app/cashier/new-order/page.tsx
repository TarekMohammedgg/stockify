import { createClient } from "@/lib/supabase/server";
import { OrderForm } from "./order-form";

type MenuItem = {
  id: string;
  name_ar: string;
  name_en: string;
  category_id: string;
  price: number;
  photo_url: string | null;
  is_available: boolean;
};

type Category = {
  id: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
};

export default async function NewOrderPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name_ar, name_en, sort_order")
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("id, name_ar, name_en, category_id, price, photo_url, is_available")
      .eq("is_available", true)
      .order("name_ar"),
  ]);

  return (
    <OrderForm
      categories={(categories ?? []) as Category[]}
      menuItems={(items ?? []) as MenuItem[]}
    />
  );
}
