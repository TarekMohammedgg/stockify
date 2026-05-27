import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/public/landing-page";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: role } = await supabase.rpc("current_user_role");
    if (role === "admin") redirect("/admin");
    if (role === "cashier") redirect("/cashier");
    if (role === "delivery") redirect("/delivery");

    // Authenticated customers skip the marketing landing and go straight to the menu.
    redirect("/menu");
  }

  return <LandingPage userProfile={null} />;
}
