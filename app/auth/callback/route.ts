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
        const { data: role } = await supabase.rpc("current_user_role");

        // Block Google OAuth for staff roles — they must use email/password
        if (
          user.app_metadata?.provider === "google" &&
          (role === "admin" || role === "cashier" || role === "delivery")
        ) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=oauth_not_allowed_for_staff`);
        }

        if (role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        }
        if (role === "cashier") {
          return NextResponse.redirect(`${origin}/cashier`);
        }
        if (role === "delivery") {
          return NextResponse.redirect(`${origin}/delivery`);
        }

        const { data: profile } = await supabase
          .from("users")
          .select("profile_complete")
          .eq("id", user.id)
          .single();

        if (!profile?.profile_complete) {
          return NextResponse.redirect(`${origin}/complete-profile`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
