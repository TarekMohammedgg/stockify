import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/menu";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // The /auth/callback route is ONLY reached after an OAuth exchange.
        // Today the app only offers Google OAuth, so anyone reaching here just
        // signed in with Google. Staff roles are not allowed to use OAuth at
        // all — block them regardless of how the JWT or app_metadata looks.
        const { data: profile } = await supabase
          .from("users")
          .select("role, profile_complete")
          .eq("id", user.id)
          .single();

        const role = profile?.role;

        if (role === "admin" || role === "cashier" || role === "delivery") {
          console.error(
            "[auth/callback] staff attempted OAuth sign-in — blocked",
            user.id,
            role,
          );
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=oauth_not_allowed_for_staff`,
          );
        }

        // Track that this customer authenticated via Google so the UI / future
        // checks can rely on the column rather than auth.users metadata.
        await supabase
          .from("users")
          .update({ auth_provider: "google" })
          .eq("id", user.id);

        if (!profile?.profile_complete) {
          return NextResponse.redirect(`${origin}/complete-profile`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
