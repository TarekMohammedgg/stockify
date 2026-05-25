# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-05-24

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

## Key Learnings

- **Project:** stockify
- **Next.js 16** renamed `middleware.ts` → `proxy.ts` with a named `proxy` export (not `middleware`). No `export const config = { matcher }` allowed — proxy runs on Node.js and intercepts all routes. Guard with path checks inside the function instead.
- **Next.js 16 searchParams** is a Promise. In client components use `useSearchParams()` hook; don't destructure from page props.
- **Supabase SSR** uses `@supabase/ssr` with `createBrowserClient` (client) and `createServerClient` (server/proxy). Cookie handling in server.ts silently ignores `setAll` errors in Server Components (handled by proxy).
- **Tailwind v4** config lives in `globals.css` via `@import "tailwindcss"` + `@theme {}`. No `tailwind.config.js` needed. Surface tokens go in `:root` CSS vars, design tokens in `@theme`.
- **`create-next-app` can't scaffold into a non-empty directory.** Workaround: scaffold to a temp dir, then copy files over (skipping conflicting AGENTS.md / CLAUDE.md).
- **Cairo font** (Google Fonts) via `next/font/google` with `subsets: ["arabic", "latin"]` is the Arabic-first font choice for this project.
- **Role guards** belong in layout Server Components (not proxy) to avoid per-request DB queries on all routes. Proxy only refreshes the session.
- **Supabase project** id `miclzbzlggnlbrvnbzgq` (URL https://miclzbzlggnlbrvnbzgq.supabase.co) had leftover orphan functions from a prior project (`is_staff`, `is_manager`, `verify_terminal_access`, `current_role`, `set_updated_at`, `handle_new_user`). Dropped during phase 1.2 hardening.
- **Seed UUID convention** (Stockify): `c1…` categories, `a1…` allergens, `b1…` ingredients, `d1…` menu_items, `e1…` orders, `f1…` users — all hex-only so they're valid UUIDs.
- **Auth callback** blocks Google OAuth for admin/cashier via `user.app_metadata.provider === "google"` check; signs out and redirects with `?error=oauth_not_allowed_for_staff`.
- **Admin actions** that create or delete users (cashiers) require `SUPABASE_SERVICE_ROLE_KEY` and use a separately constructed `@supabase/supabase-js` admin client (NOT the SSR client) — `supabase.auth.admin.createUser/deleteUser`. Trigger `handle_new_auth_user` will auto-insert a profile row with role='customer'; then UPDATE role='cashier'.
- **RTL sidebar** uses `border-s` (logical start) not `border-r`. Mobile shell uses topbar + bottom tab bar instead of off-canvas drawer for simplicity.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-05-25] Used `middleware.ts` instead of `proxy.ts` in Next.js 16 → runtime deprecation warning. Always use `proxy.ts` with `export async function proxy(req)`.
- [2026-05-25] Used `searchParams.error` directly in a client component page prop → runtime error. Always use `useSearchParams()` hook in client components.
- [2026-05-25] Used placeholder UUIDs like `i1000000-…` and `m1000000-…` in seed SQL → "invalid input syntax for type uuid" — UUIDs must be hex only (0-9, a-f). Use prefixes from {a,b,c,d,e,f} (e.g., `b` for ingredients, `d` for menu items, `e` for orders, `f` for users).
- [2026-05-25] Created Supabase views without `security_invoker=true` → advisors flag SECURITY DEFINER on view. Always `ALTER VIEW … SET (security_invoker = true)` so RLS of the calling user is enforced.

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
