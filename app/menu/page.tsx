import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PublicMenu from "@/components/public/public-menu";
import ChatbotWidget from "@/components/public/chatbot-widget";
import FirstTimeLoginDialog from "@/components/public/first-time-login-dialog";

export default async function MenuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userId: string | null = null;
  let customerName: string | null = null;
  let customerPhone: string | null = null;
  let customerAddress: string | null = null;
  let isProfileComplete = true;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("id, name, phone, address, profile_complete, role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    if (role === "admin") redirect("/admin");
    if (role === "cashier") redirect("/cashier");
    if (role === "delivery") redirect("/delivery");
    userId = profile?.id ?? null;
    customerName = profile?.name ?? null;
    customerPhone = profile?.phone ?? null;
    customerAddress = profile?.address ?? null;
    isProfileComplete = profile?.profile_complete ?? false;

    // Fallback: if the chatbot collected an address but it hasn't been
    // promoted to users.address yet, surface it to manual checkout too.
    if (userId && !customerAddress) {
      const { data: insights } = await supabase
        .from("users_insights")
        .select("user_address")
        .eq("user_id", userId)
        .maybeSingle();
      if (insights?.user_address) {
        customerAddress = insights.user_address;
      }
    }
  }

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, sort_order")
    .order("sort_order", { ascending: true });

  const { data: menuData } = await supabase
    .from("v_menu")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: ingredientsData } = await supabase
    .from("v_item_ingredients")
    .select("menu_item_id, name_ar, name_en");

  const { data: allergensData } = await supabase
    .from("v_item_allergens")
    .select("menu_item_id, name_ar, name_en");

  const categories = categoriesData || [];

  const items = (menuData || []).map((item) => ({
    id: item.id,
    name_ar: item.name_ar,
    name_en: item.name_en,
    category_ar: item.category_ar,
    category_en: item.category_en,
    price: item.price,
    photo_url: item.photo_url,
    is_available: item.is_available,
    allergens: (allergensData || [])
      .filter((a) => a.menu_item_id === item.id)
      .map((a) => ({ name_ar: a.name_ar, name_en: a.name_en })),
    ingredients: (ingredientsData || [])
      .filter((i) => i.menu_item_id === item.id)
      .map((i) => ({ name_ar: i.name_ar, name_en: i.name_en })),
  }));

  const userProfile =
    user && userId
      ? {
          id: userId,
          name: customerName ?? "",
          phone: customerPhone,
          address: customerAddress,
        }
      : null;

  return (
    <>
      <PublicMenu
        items={items}
        categories={categories}
        isLoggedIn={!!user}
        userProfile={userProfile}
      />
      {!!user && userId && (
        <>
          <ChatbotWidget
            userId={userId}
            customerName={customerName ?? "صديقنا"}
          />
          <FirstTimeLoginDialog isProfileComplete={isProfileComplete} initialName={customerName ?? ""} />
        </>
      )}
    </>
  );
}
