import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar, AdminTopbar, MobileTabBar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const name = profile?.name ?? "المدير";

  return (
    <div className="flex min-h-svh bg-[var(--surface-bg)]">
      <AdminSidebar name={name} />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopbar name={name} />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>
        <MobileTabBar />
      </div>
    </div>
  );
}
