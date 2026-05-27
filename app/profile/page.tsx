import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";

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
    .from("chatbot_insights")
    .select("favourite_items, default_address, last_seen")
    .eq("user_id", user.id)
    .maybeSingle();

  let favouriteNames: string[] = [];
  if (insights?.favourite_items?.length) {
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, name")
      .in("id", insights.favourite_items);
    if (menuItems) {
      const nameMap = Object.fromEntries(menuItems.map((m) => [m.id, m.name]));
      favouriteNames = (insights.favourite_items as string[]).map(
        (id) => nameMap[id] ?? id
      );
    }
  }

  return (
    <ProfileForm
      profile={{
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        email: user.email ?? "",
      }}
      insights={{
        defaultAddress: insights?.default_address ?? "",
        favouriteItems: favouriteNames,
        lastSeen: insights?.last_seen ?? null,
      }}
    />
  );
}
