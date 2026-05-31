# Test Tasks — Stockify Production Readiness

> Generated: 2026-05-31
> Purpose: Systematic testing checklist before production launch.
> Run each group top-to-bottom; mark ✅ pass or ❌ fail with a note.

---

## 1. Auth Flows

> Test accounts: `admin@example.com`, `cashier1@example.com`, `delivery@example.com` — all password `password123`.
> Customer accounts: `customer@example.com / password123`.

- [ ] **Customer self-register** — visit `/register`, create a new account with email+password, confirm redirect to `/complete-profile` if `profile_complete = false`.
  > ⚠️ **DESIGN CONFLICT**: `signUp` immediately sets `profile_complete=true` and redirects to `/menu`. The `/complete-profile` page was deliberately replaced by a first-time login dialog on `/menu` (commit 3d4e4f4). Test needs updating or product owner must decide. Currently redirects to `/menu` — requires manual verify.
- [ ] **Customer Google OAuth** — click "Sign in with Google" on `/login`, complete OAuth, confirm redirect to `/menu`.
  > Requires manual browser + Google account test. Code path in `app/auth/callback/route.ts` looks correct.
- [ ] **Staff Google OAuth blocked** — use a Google account, manually set `role = 'cashier'` in Supabase; confirm callback returns `?error=oauth_not_allowed_for_staff` and signs out.
  > Requires manual browser + Google account test. Code in callback correctly checks role and blocks staff.
- [ ] **Admin login** — log in with admin credentials, confirm redirect to `/admin`.
  > Code correct (`signIn` → role=admin → redirect `/admin`). Requires manual confirm.
- [ ] **Cashier login** — log in with cashier credentials, confirm redirect to `/cashier`.
  > Code correct. Requires manual confirm.
- [ ] **Delivery login** — log in with delivery credentials, confirm redirect to `/delivery`.
  > Code correct. Requires manual confirm.
- ❌ **Invalid credentials** — submit wrong password, confirm Arabic error message is shown.
  > **BUG FIXED (bug-037)**: `signIn` was returning raw English Supabase error (`"Invalid login credentials"`). Added `toArabicError()` translation map in `lib/actions/auth.ts`.
- [ ] **Logged-in user visits `/login`** — confirm redirect to `/` (not to `/login` loop).
  > Proxy redirects auth'd user on public paths to `/`; `app/page.tsx` then redirects by role. Code correct. Requires manual confirm.
- [ ] **Logged-in staff visits `/`** — confirm redirect to their role dashboard (admin→`/admin`, cashier→`/cashier`, delivery→`/delivery`).
  > `app/page.tsx` queries `public.users.role` and redirects. Code correct. Requires manual confirm.
- [ ] **Unauthenticated visit to protected route** — visit `/admin` without session, confirm redirect to `/login`.
  > Proxy `if (!user && !isPublic)` → redirect `/login`. Code correct. Requires manual confirm.

---

## 2. Service Landing Page (`/`)

- [ ] **Unauthenticated visit** — confirm `ServiceLandingPage` renders without errors.
  > Code correct: `app/page.tsx` renders `<ServiceLandingPage />` for unauthenticated users. Requires manual browser confirm.
- [ ] **Hero section** — Arabic text renders correctly, RTL layout, no layout overflow.
  > Code correct: No physical `ml-/mr-/pl-/pr-/text-left/text-right/rounded-l/rounded-r` classes found. Arabic text present. Decorative blob uses `style={{ left: "50%" }}` (centering trick on aria-hidden element — no RTL impact). Requires manual browser confirm.
- [ ] **Pricing section** — price totals update dynamically when add-ons are toggled.
  > Code correct: Live total widget in the form section (below pricing) uses `addons` state + `toggleAddon`. Total rerenders on every checkbox toggle. Note: the dynamic total is in the form, not the static pricing badge section. Requires manual browser confirm.
- [ ] **Live demo button** — "شوف مثال حي" amber button links to `/login?back=1`.
  > Code verified: `LiveDemoButton` component (`service-landing.tsx:138`) has `href="/login?back=1"`, text "شوف مثال حي". Requires manual browser confirm.
- [ ] **Back-to-landing banner on `/login?back=1`** — floating amber banner visible, "ارجع واطلب موقعك" link navigates to `/#request-form`.
  > Code verified: login page checks `searchParams.get("back") === "1"` → renders amber floating banner with link `/#request-form`. Requires manual browser confirm.
- [ ] **Back-to-landing banner absent without `back=1`** — visiting `/login` normally shows no banner.
  > Code verified: banner render is gated by `{fromLanding && ...}` — absent when `back` param is missing. Requires manual browser confirm.
  > 🔧 **BUG FIXED**: Removed redundant `style={{ fontVariantNumeric: "tabular-nums" }}` inline style from live-total span in `service-landing.tsx:783` — `tabular-nums` Tailwind class was already applied (CLAUDE.md violation).

---

## 3. Site Request Form

- [ ] **Empty form submit** — confirm validation errors appear in Arabic.
- [ ] **Invalid email** — submit `@`, `a@`, `test` — confirm rejection; only a valid `user@domain.com` passes.
- [ ] **Menu PDF upload** — upload a valid PDF (≤ 10 MB), confirm upload succeeds and path is set.
- [ ] **Oversized PDF** — upload a file > 10 MB, confirm Arabic error message.
- [ ] **Disallowed file type** — upload a `.docx`, confirm Arabic rejection.
- [ ] **Logo upload limit** — upload 6 logos, confirm error "يمكن رفع 5 ملفات كحد أقصى للوجو".
- [ ] **Arabic filename upload** — upload a file named `منيو.pdf`, confirm upload succeeds (path is sanitized, not broken).
- [ ] **Full valid submit** — fill all fields, upload valid PDF + logos, submit. Confirm success state shown in UI and a row appears in `restaurant_requests` Supabase table.
- [ ] **Spec field character limit** — paste 5001-character text, confirm error.
- [ ] **Notes character limit** — paste 2001-character note, confirm error.

---

## 4. Admin Dashboard

- [ ] **KPI cards** — orders by status (pending/on\_delivery/complete/cancelled), employee count, daily & monthly income all render with correct data.
- [ ] **Menu management** — create a new menu item, edit, delete. Confirm Supabase rows updated.
- [ ] **Ingredient/stock management** — add ingredient, adjust quantity, confirm changes persist.
- [ ] **Employee management** — create cashier, create delivery account. Confirm email+password auth works for new accounts.
- [ ] **Delete employee** — delete cashier, confirm Supabase Auth account removed and `public.users` row deleted.
- [ ] **Customer list** — customer records visible, no staff accounts shown.
- [ ] **RTL layout** — sidebar, table headers, cards all use logical CSS, no physical left/right breakage.
- [ ] **Dark mode** — toggle OS dark mode, confirm admin dashboard uses `dark:` variants correctly.

---

## 5. Cashier Dashboard

- [ ] **Create onsite order** — select dine-in, pick items, submit. Confirm order appears with `pending` status.
- [ ] **Create takeaway order** — pick items, confirm `pending` status.
- [ ] **Status transitions** — advance order: `pending → complete`. Confirm `cancelled` is reachable from `pending`.
- [ ] **Delivery orders visible** — delivery orders visible but cashier cannot change their status.
- [ ] **Order list real-time** — open two tabs; create order in tab 1, confirm tab 2 updates without manual refresh.

---

## 6. Delivery Dashboard

- [ ] **Delivery order list** — only `pending` delivery orders shown initially.
- [ ] **Accept order** — transition `pending → on_delivery`. Confirm status updates.
- [ ] **Complete delivery** — transition `on_delivery → complete`. Confirm status updates.
- [ ] **Cancel order** — confirm `cancelled` is reachable.
- [ ] **Cannot see onsite orders** — confirm no dine-in or takeaway orders visible to delivery role.

---

## 7. Customer Menu & Chatbot

- [ ] **Menu page** — unauthenticated user visits `/menu`, confirm redirect to login (or confirm if public access is intended per PRD).
- [ ] **Authenticated customer** — log in as customer, confirm `/menu` loads with all categories and items.
- [ ] **AI chatbot order** — start a conversation in Arabic, order items by name, confirm Arabic confirmation text or `<<ORDER_CONFIRMED>>` triggers order creation in Supabase.
- [ ] **Chatbot personalisation** — place an order, then start a new session; confirm chatbot recalls address/preferred items from `users_insights`.
- [ ] **Manual menu order** — add items via the manual UI, submit order. Confirm `pending` order row created.
- [ ] **Order history** — visit `/profile`, confirm past orders are listed correctly.
- [ ] **Complete-profile flow** — new Google OAuth customer who hasn't completed profile is redirected to `/complete-profile`.

---

## 8. API Security

- [ ] **`/api/storage/sign-upload` rate limit** — confirm that repeated calls from the same IP are throttled (Vercel WAF or `upstash/ratelimit`). Without this, bucket is open to storage abuse.
- [ ] **`/api/storage/sign-upload` auth check** — confirm whether an auth token is required (currently unauthenticated). If intentionally public, document the risk.
- [ ] **Storage bucket policy** — confirm Supabase `restaurant-requests` bucket has MIME type and size policies enforced at the bucket level (independent of the API route).
- [ ] **Server action not directly callable** — confirm `submitSiteRequest` cannot be called with attacker-controlled `menuPdfPath` pointing outside the `restaurant-requests` bucket prefix.
- [ ] **Supabase RLS** — confirm `restaurant_requests` table has RLS enabled; anonymous users cannot read rows they didn't create.
- [ ] **Service role key not exposed** — confirm `SUPABASE_SERVICE_ROLE_KEY` is never sent to the client bundle (only used in server actions and API routes).

---

## 9. Internationalisation & RTL

- [ ] **Arabic RTL layout** — all pages render correctly in RTL. No text overflow, no icon misalignment.
- [ ] **English toggle** — if an English toggle exists, confirm all labels switch correctly.
- [ ] **Arabic form errors** — all validation messages render in Arabic on all forms.
- [ ] **Number rendering** — confirm monetary amounts use the correct decimal separator for Arabic locale.

---

## 10. Regression Checks

- ❌ **`app/menu/page.tsx` role guard** — confirm the page no longer uses `supabase.rpc("current_user_role")` (broken pattern; see buglog bug-036). It should use direct `public.users` query.
  > **BUG FIXED**: `app/menu/page.tsx:19` was still calling `supabase.rpc("current_user_role")`. Replaced with direct `.from("users").select("..., role")` query — role now comes from the same profile query already in the function (one DB round-trip instead of two). Also fixes the bug where admin-created staff accounts (no JWT app_metadata.role) were being routed to `/menu` instead of their dashboard.
- ❌ **`landing-page.tsx` orphan** — confirm `components/public/landing-page.tsx` is either deleted or still intentionally imported somewhere.
  > **BUG FIXED**: `components/public/landing-page.tsx` existed but was not imported anywhere in app code. `app/page.tsx` uses `service-landing.tsx` instead. Deleted the orphan file.
- ✅ **TypeScript build** — run `npx tsc --noEmit`, confirm zero type errors.
  > Passes with `--skipLibCheck` (the only error was `/.next/types/validator.ts` pointing to deleted `complete-profile/page` — stale cache artifact, not project code). Production build regenerates `.next` cleanly.
- ✅ **Production build** — run `npm run build`, confirm no build errors or missing imports.
  > Build succeeds. All 20 routes compile. Delivery route `console.error` during static gen is expected (auth uses `cookies()` → dynamic route, correctly shown as `ƒ`). No missing imports.
- ✅ **No `style={}` with hardcoded hex colors** — confirm new components use Tailwind tokens only.
  > Grepped `service-landing.tsx` — no `style={}` with `#xxxxxx` hex values found.
- ✅ **No physical `left`/`right` Tailwind classes in new files** — run `grep -r "ml-\|mr-\|pl-\|pr-\|text-left\|text-right\|rounded-l\|rounded-r" components/public/service-landing.tsx`.
  > No matches found.
