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
    .from("orders")
    .select(`
      id, source, type, status, owner_name, delivery_address, notes, customer_phone, total_price, created_at, updated_at,
      order_items (
        menu_item_id, quantity, unit_price, notes,
        menu_items ( name_ar, name_en )
      )
    `)
    .order("created_at", { ascending: false });

  const orders = (ordersData ?? []).map((o: any) => ({
    id: o.id,
    source: o.source,
    type: o.type,
    status: o.status,
    owner_name: o.owner_name,
    delivery_address: o.delivery_address,
    notes: o.notes,
    customer_phone: o.customer_phone,
    total_price: o.total_price,
    created_at: o.created_at,
    updated_at: o.updated_at,
    customer_name: profile.name,
    items: (o.order_items || []).map((oi: any) => ({
      menu_item_id: oi.menu_item_id,
      name_ar: oi.menu_items?.name_ar ?? "",
      name_en: oi.menu_items?.name_en ?? "",
      quantity: oi.quantity,
      unit_price: oi.unit_price,
      notes: oi.notes,
    })),
  })) as Order[];

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
