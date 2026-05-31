import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ServiceLandingPage from "@/components/public/service-landing";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    if (role === "admin") redirect("/admin");
    if (role === "cashier") redirect("/cashier");
    if (role === "delivery") redirect("/delivery");

    redirect("/menu");
  }

  return <ServiceLandingPage />;
}
