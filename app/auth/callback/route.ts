/**
 * Google OAuth callback handler.
 *
 * REQUIRED SETUP — Google Cloud Console (https://console.cloud.google.com):
 *   OAuth 2.0 Client → Authorized redirect URIs must include ALL of:
 *     • http://localhost:3000/auth/callback          (local dev)
 *     • https://<your-vercel-domain>/auth/callback   (Vercel production / preview)
 *     • https://miclzbzlggnlbrvnbzgq.supabase.co/auth/v1/callback  (Supabase internal)
 *
 *   In Supabase Dashboard → Authentication → Providers → Google:
 *     • Client ID and Client Secret must match the Google Cloud Console OAuth credentials.
 *     • Redirect URL shown there must be listed in the Google Console authorized URIs.
 *
 *   The "This browser or app may not be secure" error means the redirect URI used at
 *   sign-in time is not in the Google Console's authorized list — add it there, no code
 *   change is needed.
 */
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/** Validate and sanitise the `next` redirect target to prevent open-redirect attacks. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/menu";
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

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

        // Remove the profile_complete check since we show a dialog on /menu
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
