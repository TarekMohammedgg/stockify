import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/public/landing-page";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
  } | null = null;

  if (user) {
    const { data: role } = await supabase.rpc("current_user_role");
    if (role === "admin") redirect("/admin");
    if (role === "cashier") redirect("/cashier");
    if (role === "delivery") redirect("/delivery");

    const { data: profile } = await supabase
      .from("users")
      .select("id, name, phone, address")
      .eq("id", user.id)
      .single();

    if (profile?.id) {
      userProfile = {
        id: profile.id,
        name: profile.name ?? "",
        phone: profile.phone ?? null,
        address: profile.address ?? null,
      };
    }
  }

  return <LandingPage userProfile={userProfile} />;
}
