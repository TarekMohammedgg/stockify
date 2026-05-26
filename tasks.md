# Stockify — Build Tasks

Derived from `docs/PRD.md` (v1.0). Organized by milestone phases.

---

## Phase 1 — Foundation: Auth + Role Routing + DB Schema

### 1.1 Project Setup
- [x] Initialize Next.js (App Router) project with TypeScript
- [x] Configure Tailwind CSS v4 with RTL support
- [x] Install Lucide React for icons
- [x] Configure dark mode via `dark:` variant (prefers-color-scheme)
- [x] Set up project structure (`/app`, `/components`, `/lib`, `/api`)
- [x] Configure ESLint + Prettier
- [x] Set up `.env.local` for Supabase + OpenRouter keys

### 1.2 Supabase Database
- [x] Create Supabase project
- [x] Run `stockify-supabase-schema.sql` (tables: users, categories, allergens, ingredients, menu_items, menu_item_ingredients, menu_item_allergens, orders, order_items, chatbot_insights)
- [x] Create views: `v_menu`, `v_item_ingredients`, `v_item_allergens`, `v_orders`, `v_low_stock`
- [x] Seed dummy data (categories, allergens, sample menu items)
- [x] Configure Row Level Security (RLS) policies per role
- [x] Pre-seed Admin account (requires Supabase Dashboard → Auth → Add User, then `UPDATE users SET role='admin' WHERE id='<uuid>'`)

### 1.2.D Delivery Role — DB Migration
- [x] Write Supabase migration to add `'delivery'` value to the `users.role` enum
- [x] Write Supabase migration to update the `orders.status` enum to `pending | on_delivery | complete | cancelled` (current enum uses preparing/ready/completed)
- [x] Data backfill plan: map existing `preparing` → `on_delivery`, `ready` → `on_delivery`, `completed` → `complete`; document rollback strategy
- [x] Update local `supabase/schema.sql` to reflect new role + status enum values and any seed data
- [x] Update any DB views (`v_orders`, etc.) that reference old status strings
- [x] Update TypeScript types / `OrderStatus` union in `lib/actions/cashier.ts` to match new enum

### 1.3 Authentication
- [x] Configure Supabase Auth (email/password + Google OAuth provider)
- [x] Build `/login` page (form + "Continue with Google" button)
- [x] Build `/register` page (customer self-registration: name, phone, email, password)
- [x] Implement Google OAuth callback handler
- [x] Build "Complete Profile" step (phone + address) for new Google customers
- [x] Implement role-based redirect after login (admin → `/admin`, cashier → `/cashier`, customer → `/`)
- [x] Create middleware for protected routes
- [x] Block Google OAuth for Admin/Cashier roles

### 1.3.D Delivery Role — Auth & Routing
- [x] Extend role-based redirect to send `delivery` users to `/delivery` after login
- [x] Update `proxy.ts` (middleware) to guard `/delivery` — only `role='delivery'` may access; redirect others appropriately
- [x] Block Google OAuth for the `delivery` role (same restriction as admin/cashier)
- [x] Add server-side role check helper for delivery pages (reject admin/cashier/customer impersonation attempts)

---

## Phase 2 — Admin Dashboard

### 2.1 Admin Shell
- [x] Build `/admin` layout with sidebar navigation (Arabic RTL)
- [x] Build admin dashboard home with quick stats

### 2.2 Menu Management (`/admin/menu`)
- [x] List view of all menu items
- [x] Add Item form (name AR+EN, category, price EGP, photo URL, ingredients, allergens, availability)
- [x] Edit Item form
- [x] Remove Item with confirmation
- [x] Availability toggle

### 2.3 Ingredient & Stock Management (`/admin/ingredients`)
- [x] List view of all ingredients with stock levels
- [x] Add Ingredient (name AR+EN, stock_quantity, unit, low_stock_threshold)
- [x] Edit Ingredient
- [x] Remove Ingredient
- [x] Show which menu items use each ingredient

### 2.4 Employee Management (`/admin/employees`)
- [x] List view of cashier accounts
- [x] Add Cashier (full name, username, password, status)
- [x] Edit Cashier details
- [x] Remove / deactivate Cashier
- [x] Extend employee list to show Delivery accounts alongside Cashiers (role column / filter)
- [x] Add Delivery employee form (full name, username, password, role=delivery, status)
- [x] Edit Delivery employee details (including role switch between cashier/delivery if needed)
- [x] Remove / deactivate Delivery employee
- [x] Update admin dashboard "employees count" KPI to include delivery staff

---

## Phase 3 — Cashier Dashboard

### 3.1 Orders Panel (`/cashier`)
- [x] Live order list (Supabase realtime subscription)
- [x] Order card UI (ID, timestamp, type badge, source, items, customer info)
- [x] Order detail view
- [x] Status update buttons: Pending → Preparing → Ready → Completed
- [x] Cancel button (sets status to 'cancelled')
- [x] Filter by status

### 3.2 New Onsite Order (`/cashier/new-order`)
- [x] Menu item picker (by category)
- [x] Cart with quantity controls
- [x] Order type selector: Dine-in (no extra info) / Takeaway (owner name)
- [x] Confirm & submit → appears in order list

### 3.3 Inventory Alerts
- [x] Banner at top of cashier dashboard
- [x] Fetch from `v_low_stock` view
- [x] Color-coded: Yellow (low) / Red (out of stock)

### 3.4 Cashier — Delivery Order Visibility
- [ ] Ensure cashier orders panel lists delivery-type orders as read-only for status (visible but transitions disabled per PRD §5.5)
- [ ] Update status-update buttons in `app/cashier/orders-panel.tsx` to use new enum values (`pending` / `on_delivery` / `complete` / `cancelled`)
- [x] Restrict cashier status mutations server-side to non-delivery orders only
- [x] Confirm cashier "New Order → Delivery" path still creates orders with `type='delivery'` and status `pending` so they surface in the delivery dashboard

---

## Phase 3.5 — Delivery Dashboard

### 3.5.1 Delivery Shell & Routing
- [x] Create `/delivery` route group (`app/delivery/`) with mobile-first layout
- [x] Build `app/delivery/layout.tsx` (Arabic RTL default, English toggle, top bar with logout)
- [x] Build `app/delivery/loading.tsx` skeleton state
- [x] Server-side role guard in `app/delivery/page.tsx` (redirect non-delivery users)

### 3.5.2 Delivery Orders Panel (`/delivery`)
- [x] Live list of orders filtered to `type='delivery'` (Supabase realtime subscription)
- [x] Filter / default sort: pending and on_delivery first, then complete/cancelled
- [x] Order card UI: order ID, timestamp, items list w/ quantities, customer name, phone, delivery address, notes, current status
- [x] Status update buttons: `Pending → On-Delivery → Complete`, plus `Cancelled` (terminal from any non-complete state)
- [x] Confirmation prompt before `Cancelled` transition
- [x] Use lucide-react icons (Truck, CheckCircle, XCircle, Clock) — no inline SVG
- [x] Arabic-first labels with English toggle (status labels, action buttons)
- [x] Tailwind v4 utility classes only — no inline `style={}`, no hardcoded hex colors
- [x] Use logical properties (`start`/`end`) for RTL correctness
- [x] Dark mode via `dark:` variant
- [x] Empty state when no delivery orders exist
- [x] Error / offline state with retry

### 3.5.3 Delivery Server Actions
- [x] Create `lib/actions/delivery.ts` with server actions: `listDeliveryOrders()`, `updateDeliveryOrderStatus(orderId, status)`
- [x] Server-side validation: only allow status transitions defined in PRD (Pending → On-Delivery → Complete / Cancelled)
- [x] Reject mutations on non-delivery orders or by non-delivery users
- [x] Log errors with function name + order ID context

### 3.5.4 Delivery RLS Policies
- [x] RLS on `orders`: delivery role may `SELECT` only rows where `type='delivery'`
- [x] RLS on `orders`: delivery role may `UPDATE` only the `status` column (and only on delivery-type rows)
- [x] RLS on `users`: delivery role may `SELECT` minimal customer fields (name, phone, address) needed for delivery cards — denied for everything else
- [x] RLS on `order_items`: delivery role may `SELECT` items belonging to delivery orders only
- [x] Deny delivery role access to `menu_items`, `ingredients`, `categories`, `allergens`, `chatbot_insights` write operations (read-only or none, per least privilege)
- [x] Smoke test RLS via Supabase SQL editor with a delivery JWT

---

## Phase 4 — Public Menu Page

- [ ] `/` landing/menu page (Arabic RTL by default)
- [ ] Language toggle (AR/EN)
- [ ] Category filter
- [ ] Menu item cards (photo, name, price, ingredients, allergen badges)
- [ ] "Order Now" button (opens chatbot if logged in, else redirects to login)
- [ ] Responsive layout (desktop priority, mobile supported)
- [ ] Performance: page load < 2s

---

## Phase 5 — Chatbot Widget + OpenRouter Integration

### 5.1 API Routes
- [ ] `GET /api/menu` — full menu list
- [ ] `GET /api/menu/[id]/ingredients` — ingredients + allergens
- [ ] `GET /api/insights?user_id=…` — customer favourites + saved address
- [ ] `POST /api/orders` — submit new order
- [ ] `GET /api/orders` — fetch for cashier dashboard
- [ ] `PATCH /api/orders/[id]` — update status
- [ ] `POST /api/chat` — OpenRouter chatbot handler

### 5.2 Chatbot Widget
- [ ] Floating bottom-right widget (logged-in customers only)
- [ ] Greets customer by name from account
- [ ] System prompt with current menu context
- [ ] Egyptian Arabic dialect responses
- [ ] Order type prompt (Delivery / Takeaway)
- [ ] Pre-fill phone + address from account (editable)
- [ ] New-vs-returning branching: new customer → collect phone (+ address if delivery); returning → silently load insights
- [ ] Verify delivery flow collects + persists delivery address before submission
- [ ] Item selection + quantity + notes
- [ ] Handle modifications (remove onions, extra sauce, etc.)
- [ ] Order summary confirmation
- [ ] Submit structured order to `/api/orders`
- [ ] Update `chatbot_insights` (favourite_items, default_address, last_seen)
- [ ] Do NOT persist full conversation logs

---

## Phase 6 — UI/UX Design System

### 6.1 Design Foundations
- [ ] Define color palette (primary, secondary, accent, semantic states) with Tailwind theme tokens
- [ ] Define typography scale (Arabic-first font stack + English fallback, sizes, weights, line-heights)
- [ ] Define spacing & sizing scale (consistent rem-based tokens)
- [ ] Define border-radius, shadow, and elevation tokens
- [ ] Configure dark mode palette parallel to light mode
- [x] Document design tokens in a central reference (e.g. `tailwind.config` or `globals.css`)

### 6.2 Core UI Components
- [ ] Button (primary, secondary, ghost, destructive, icon-only, loading state)
- [ ] Input, Textarea, Select, Checkbox, Radio, Toggle
- [ ] Card (menu card, order card, stat card variants)
- [ ] Modal / Dialog with RTL-aware close affordance
- [ ] Toast / Alert / Banner (info, success, warning, error)
- [ ] Badge / Tag (allergen badges, order type, status pills)
- [ ] Table / List rows for admin & cashier dashboards
- [ ] Sidebar / TopNav shell components
- [ ] Empty state, Loading skeleton, Error state components

### 6.3 Page-Level UX
- [ ] Login & Register screens — clean Arabic-first layout, Google button styling
- [ ] Public menu page — hero, category filter chips, responsive grid, item card hover/focus states
- [ ] Chatbot widget — floating launcher, expanded panel, message bubbles, typing indicator
- [ ] Admin dashboard — sidebar IA, content density, breadcrumbs/page titles
- [ ] Cashier dashboard — live order grid, status color system, alert banner hierarchy
- [ ] Mobile responsive breakpoints audit for all pages

### 6.4 RTL, Accessibility & Polish
- [ ] Audit all components for logical properties (no `left`/`right`, use `start`/`end`)
- [ ] Verify icon mirroring (chevrons, arrows) under RTL
- [ ] Color contrast meets WCAG AA on light + dark modes
- [ ] Keyboard navigation & visible focus rings on all interactive elements
- [ ] ARIA labels for icon-only buttons and live regions (orders, alerts)
- [ ] Reduced-motion respect for animations
- [ ] Run `openwolf designqc` and iterate on captured screenshots

---

## Phase 7 — QA, RTL Polish, Deployment

### 7.1 QA
- [ ] E2E test login flows (all 4 roles + Google OAuth)
- [ ] E2E test admin CRUD operations
- [ ] E2E test cashier order lifecycle
- [ ] E2E test customer chatbot order flow
- [ ] E2E test delivery login → see only delivery orders → Pending → On-Delivery → Complete
- [ ] E2E test delivery cancellation path (Cancelled from Pending and from On-Delivery)
- [ ] Verify cashier cannot mutate delivery order status (RLS + UI both enforce)
- [ ] Verify admin/customer accounts cannot access `/delivery` (route guard + RLS)
- [ ] Verify delivery account cannot access `/admin`, `/cashier`, or menu/ingredient APIs
- [ ] Verify admin can create / edit / deactivate a delivery employee end-to-end
- [ ] Verify low-stock alerts trigger correctly
- [ ] DevTools MCP testing for UI changes (including `/delivery` mobile viewport)

### 7.2 RTL & i18n Polish
- [ ] Audit all components for logical properties (no `left`/`right`)
- [ ] Verify Arabic typography & font rendering
- [ ] Test English LTR toggle on all pages
- [ ] Check allergen badges & icons in RTL context

### 7.3 Security
- [ ] Verify role-based access on all routes
- [ ] Confirm RLS policies block cross-role data access
- [ ] Audit API routes for auth checks
- [ ] Confirm no secrets in client bundle

### 7.4 Deployment
- [ ] Configure Vercel project
- [ ] Set production env vars (Supabase, OpenRouter, Google OAuth)
- [ ] Configure Next.js `images.remotePatterns` for Unsplash
- [ ] Deploy to production
- [ ] Smoke test all flows in production
- [ ] Update `CLAUDE.md` and `AGENTS.md` (reflect 4-role model: Admin / Cashier / Delivery / Customer, new status enum, `/delivery` route)

---

## Out of Scope (v1.0)
Online payment, loyalty program, KDS, multi-branch, mobile app, conversation history logs, analytics dashboard, WhatsApp integration.
