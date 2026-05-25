import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: role } = await supabase.rpc("current_user_role");

  if (role === "admin") redirect("/admin");
  if (role === "cashier") redirect("/cashier");

  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[var(--surface-bg)] px-4 text-center">
      <h1 className="font-display text-3xl text-[var(--text-primary)]">
        مرحباً {profile?.name ?? ""}
      </h1>
      <p className="text-[var(--text-muted)]">
        منيو العميل سيتم بناؤه في المرحلة الرابعة.
      </p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full border border-[var(--surface-border)] px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)] transition-colors"
        >
          تسجيل الخروج
        </button>
      </form>
    </div>
  );
}
