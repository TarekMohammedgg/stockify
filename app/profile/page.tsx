import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";
import type { Order } from "@/lib/actions/cashier";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, phone, address, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "customer") redirect("/");

  const { data: insights } = await supabase
    .from("users_insights")
    .select("favourite_items, user_address, user_phone, last_seen")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: ordersData } = await supabase
    .from("v_orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (ordersData ?? []) as Order[];

  return (
    <ProfileForm
      profile={{
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        email: user.email ?? "",
      }}
      insights={{
        defaultAddress: insights?.user_address ?? "",
        favouriteItems: (insights?.favourite_items as string[]) ?? [],
        lastSeen: insights?.last_seen ?? null,
      }}
      orders={orders}
    />
  );
}
