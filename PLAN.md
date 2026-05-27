# Plan: Admin Home Final Touches — Real Data + Clickable Drill-downs

## Context

The admin home (`/admin`) currently renders KPI cards and a low-stock ledger, but it has gaps that the user wants closed before launch:

1. **Daily revenue is always 0** — `app/admin/page.tsx:42` filters orders by `status='completed'`, but the canonical enum in `supabase/schema.sql:31` and CLAUDE.md is **`complete`** (no trailing "d"). The query never matches, so the hero KPI is always `0`. Same bug will affect the monthly revenue we want to add.
2. **The "طلبات اليوم" (orders) card** currently links to `/cashier` — i.e. it shoves the admin into the cashier panel, which is filtered to non-delivery orders and only exposes cashier-allowed transitions (`pending → complete`). The user wants admin to see **all** orders and have **full permissions** to edit any status transition.
3. **The "تنبيهات المخزون" card** opens `/admin/ingredients` showing every ingredient. The user wants the low-stock page to land on a filtered view (just low + out_of_stock).
4. **The "العملاء المسجّلون" card** is dead (no `href`). The user wants a customers list page that surfaces each customer's profile + `chatbot_insights` row (default address, favourites, last seen) and their order history.

The chatbot already writes into `public.chatbot_insights` (one row per user, with `favourite_items UUID[]`, `default_address`, `last_seen`) — we just need to read it.

## Goal

- Fix the silent revenue bug and add monthly revenue to the admin hero.
- Build `/admin/orders` — admin sees every order, can transition to any of `pending | on_delivery | complete | cancelled`.
- Build `/admin/customers` — table of customers + drill-down panel with insights + order summary.
- Make `/admin/ingredients?filter=low` land on a low-stock-only view.
- Wire the four admin home cards to their real destinations and add the two new pages to the sidebar.

## Files to change / create

### 1. `lib/actions/admin.ts` — extend with admin-grade actions
- Add `updateOrderStatusAdmin(id: string, status: OrderStatus)`:
  - `"use server"` server action.
  - No transition guard (unlike `lib/actions/cashier.ts:60`'s `CASHIER_ALLOWED_STATUSES`). Admin can move to any of the 4 enum values, including `on_delivery`.
  - Validate the input string is one of the 4 enum values; log + return `{ error }` if not.
  - `.update({ status }).eq("id", id).select("id").maybeSingle()` to detect RLS-blocked 0-row writes (same pattern we use in `lib/actions/delivery.ts`).
  - `revalidatePath('/admin/orders')` and `/admin` on success.
- Add `listAllOrders(): Promise<Order[]>` reading from `v_orders` (sorted desc by `created_at`). Reuse the `Order` type already exported by `lib/actions/cashier.ts`.
- Add `listCustomers()` returning `{ id, name, phone, email, address, created_at, insights, order_count, last_order_at, total_spend }[]`:
  - Query `users` where `role='customer'`.
  - LEFT JOIN `chatbot_insights` (two queries merged by `user_id`).
  - Aggregate `orders` per customer: count + max(created_at) + sum(total_price for status='complete').
  - Sort by `last_order_at` desc nulls last.
  - Resolve each insights row's `favourite_items UUID[]` to menu item names by one batched `menu_items` query.

### 2. `app/admin/page.tsx` — fix revenue + rewire card hrefs
- Replace the `status='completed'` filter with `status='complete'` (PRD-canonical).
- Add a second revenue query for the current month: `gte('created_at', firstOfMonth.toISOString())` + `eq('status','complete')`. Render under hero "إيرادات اليوم" as eyebrow "هذا الشهر" + numeric.
- Card href changes:
  - `طلبات اليوم` → `/admin/orders` (was `/cashier`)
  - `العملاء المسجّلون` → `/admin/customers` (was no href)
  - `تنبيهات المخزون` → `/admin/ingredients?filter=low` (was `/admin/ingredients`)
  - Other cards unchanged.

### 3. `app/admin/orders/page.tsx` — new
- Server component, `export const dynamic = 'force-dynamic'`.
- Calls `listAllOrders()` from `lib/actions/admin.ts`.
- Renders `<AdminOrdersPanel initialOrders={...} />`.

### 4. `app/admin/orders/orders-panel.tsx` — new
- `"use client"`. Modeled on `app/cashier/orders-panel.tsx` (status chip helpers, `STATUS_LABELS`, type icons, filter tabs, realtime channel on `orders` table). Reuse the same Tailwind tokens and lucide icons.
- Key admin-only differences:
  - Each card shows a **status selector** (segmented control or `<select>`) instead of a single "advance" button. Options = all 4 enum values except the current one. Picking one calls `updateOrderStatusAdmin` with optimistic update + rollback + per-card red banner on error (same pattern we use in `app/delivery/delivery-panel.tsx`).
  - Delivery orders are **not** read-only here — admin sees + edits everything.
  - Filter tabs: All / pending / on_delivery / complete / cancelled, plus a secondary filter for `type` (all / dine-in / takeaway / delivery).
- Reuse the realtime channel pattern from cashier — subscribe to `orders` postgres_changes and refetch via `/api/orders-refresh` (already exists).

### 5. `app/admin/orders/loading.tsx` — new
- Mirror skeleton style used in `app/admin/ingredients/loading.tsx`.

### 6. `app/admin/ingredients/page.tsx` + `manager.tsx` — low-stock filter
- `page.tsx`: read `searchParams.filter` (`'low' | undefined`). Pass `initialFilter` prop into `IngredientsManager`.
- `manager.tsx`: add a top toggle (segmented control: "الكل" / "منخفض فقط"). When low-only, filter `initial` to rows where `stock_quantity <= low_stock_threshold`. URL stays in sync via `router.replace`.
- When the home card links to `?filter=low`, the manager mounts with the low toggle already active.

### 7. `app/admin/customers/page.tsx` — new
- Server component, dynamic. Calls `listCustomers()` from `lib/actions/admin.ts`.
- Renders `<CustomersList initial={...} />` inside the same editorial layout used by `app/admin/ingredients/page.tsx`.

### 8. `app/admin/customers/customers-list.tsx` — new
- `"use client"`.
- Table-style ledger matching `app/admin/ingredients/manager.tsx`'s grid (eyebrow row + `divide-dashed` `<ul>`).
- Columns: index | name + email/phone | عنوان (address or insights.default_address fallback) | طلبات (order_count) | آخر طلب (relative time) | إجمالي إنفاق | ⌄ expand.
- Click a row → expand inline to show:
  - Full profile (`name`, `phone`, `email`, `address`, `created_at`, `auth_provider`, `is_active`).
  - Insights (from `chatbot_insights`): `default_address`, `last_seen`, `favourite_items` resolved to menu item names.
  - Order summary card (count, last date, total spend).
- Search bar at top filtering by name / phone / email client-side.

### 9. `components/admin/sidebar.tsx` — add two nav items
- Extend the `nav` array (currently 4 entries) with:
  - `{ href: '/admin/orders', label: 'الطلبات', en: 'Orders', icon: Receipt }`
  - `{ href: '/admin/customers', label: 'العملاء', en: 'Customers', icon: Users }`
- Insert Orders between Overview and Menu; Customers at the end.
- Mobile tab bar pulls from the same array — 6 items will be cramped but acceptable; alternatively hide Customers on `<sm`.

### 10. OpenWolf bookkeeping (after implementation)
- `.wolf/buglog.json`: append entry for the `status='completed'` vs `complete` bug.
- `.wolf/anatomy.md`: add entries for new files under `app/admin/orders/` and `app/admin/customers/`.
- `.wolf/memory.md`: one-line entry per protocol.

## Out of scope (deliberately)

- No new docs files beyond this PLAN.md (per request).
- No schema changes — `chatbot_insights` already exists and is populated.
- No bulk order ops (multi-select). Admin transitions one order at a time.
- No customer edit/delete in this pass — we're surfacing data, not adding admin-CRUD over customers.

## Verification

1. `npm run dev`. Log in as admin (`tarekmohammedgg@gmail.com`).
2. Open `/admin` — confirm "إيرادات اليوم" shows the real sum of today's `complete` orders (not 0). Spot-check via Supabase MCP `execute_sql`: `SELECT SUM(total_price) FROM orders WHERE status='complete' AND created_at >= CURRENT_DATE`.
3. Click "طلبات اليوم" → lands on `/admin/orders`. All orders visible regardless of type. Pick a `pending` order, change status to `on_delivery` via the selector → DB row updates (verify with SELECT). Then to `complete` and `cancelled` — all four transitions reachable.
4. Open a second tab as cashier, create a new order → admin's `/admin/orders` reflects it within ~2 s via realtime.
5. Click "تنبيهات المخزون" → lands on `/admin/ingredients?filter=low`, "منخفض فقط" toggle is active, only low/out items are listed. Toggle "الكل" → all rows appear.
6. Click "العملاء المسجّلون" → `/admin/customers` shows the customer table. Expand a row → name, phone, default address from insights, last_seen, favourite item names, order count, last order date, total spend all populated for a customer who has both an insights row and orders.
7. Force an error path (temporarily flip admin role) — confirm the per-card red banner appears in Arabic and optimistic state rolls back.
8. After verification, append `.wolf/memory.md` / `.wolf/buglog.json` entries per OpenWolf.
