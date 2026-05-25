import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role, profile_complete")
          .eq("id", user.id)
          .single();

        const provider = user.app_metadata?.provider;

        // Block Google OAuth for staff roles — admin/cashier must use email/password
        if (
          provider === "google" &&
          (profile?.role === "admin" || profile?.role === "cashier")
        ) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=oauth_not_allowed_for_staff`,
          );
        }

        if (profile?.role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        }
        if (profile?.role === "cashier") {
          return NextResponse.redirect(`${origin}/cashier`);
        }
        if (!profile?.profile_complete) {
          return NextResponse.redirect(`${origin}/complete-profile`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
