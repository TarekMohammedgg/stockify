# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-05-24

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- **Aesthetic direction (admin):** "Suq Editorial" — warm paper canvas, saffron + terracotta + ink ink, Reem Kufi (display) + Fraunces (numeric serif) + Cairo (body). Editorial hierarchy: eyebrow small-caps labels, large display headings, serif numeric stats, ornamental hairline dividers. Confirmed 2026-05-25.
- User confirmed "Full visual overhaul" for admin and approved this aesthetic over dark/minimal alternatives.

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
- [2026-05-26] Asked AI (Gemini 2.5 Flash Lite) to reproduce full UUIDs in JSON extraction prompts → truncated JSON (`"d1000000-0...`) causing `SyntaxError: Unterminated string`. NEVER ask AI to output UUIDs in extraction. Always use human-readable identifiers (item names) in extraction JSON, then resolve names → IDs server-side using the menu array already in memory.
- [2026-05-26] `<<ORDER_CONFIRMED>>` marker: Gemini follows the spirit (writes Arabic confirmation text) but drops the literal token. Always add fallback phrase detection (`"جاري تسجيل طلبك"`, `"تم تسجيل طلبك"`) alongside marker detection — never rely on a single signal.

## Key Learnings (continued)

- **Chatbot order extraction pattern**: Two-phase AI call — first for conversation reply, second for structured JSON extraction when order is confirmed. The extraction call uses `response_format: { type: "json_object" }` and `max_tokens: 512`. Item names (not UUIDs) are used in the JSON; backend resolves names → real IDs using the already-fetched menu array.
- **`chatbot_insights` persistence**: After every confirmed order, upsert `user_id`, `favourite_items` (array of menu_item_id UUIDs), `default_address` (if delivery), and `last_seen`. On next chatbot session, route.ts fetches these and builds a personalised system prompt so the bot doesn't re-ask for address/phone.
- **Seed UUID `d1...` prefix** resolves to menu items (e.g., `d1000000-0000-0000-0000-00000000000c` = سندوتش فلافل).

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- **[2026-05-26] Order status enum**: PRD §7 (`pending | on_delivery | complete | cancelled`) wins over the 5-value enum in `docs/SUPABASE_SCHEMA.md` (`pending | preparing | ready | completed | cancelled`). Code must use the 4-value PRD enum; the SQL file is the one out of sync and must be reconciled.
- **[2026-05-26] User role enum**: `user_role` must include `delivery` (per PRD §7). The SQL file in `docs/` is missing it — that's a schema bug, not a code workaround. The codebase already redirects `delivery → /delivery` in `lib/actions/auth.ts`.
- **[2026-05-26] Staff auth method**: All staff roles (admin / cashier / delivery) authenticate with **email + password** via Supabase Auth — not arbitrary usernames. PRD wording "Username + Password" is informal; the codebase uses email. Google OAuth is customer-only.
- **[2026-05-26] Tailwind v4** locked as the only allowed styling system (`@tailwindcss/postcss`). No v3 fallback.
- **[2026-05-26] Pinned versions in CLAUDE.md**: Next.js 16.2.6, React 19.2.4, TypeScript ^5, `@types/node` ^20. Drift requires an explicit bump task — don't change ad hoc.
