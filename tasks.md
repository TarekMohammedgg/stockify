# Stockify — Build Tasks

Derived from `docs/PRD.md` (v1.0). Organized by milestone phases.

---

## Phase 1 — Foundation: Auth + Role Routing + DB Schema

### 1.1 Project Setup
- [ ] Initialize Next.js (App Router) project with TypeScript
- [ ] Configure Tailwind CSS v4 with RTL support
- [ ] Install Lucide React for icons
- [ ] Configure dark mode via `dark:` variant (prefers-color-scheme)
- [ ] Set up project structure (`/app`, `/components`, `/lib`, `/api`)
- [ ] Configure ESLint + Prettier
- [ ] Set up `.env.local` for Supabase + OpenRouter keys

### 1.2 Supabase Database
- [ ] Create Supabase project
- [ ] Run `stockify-supabase-schema.sql` (tables: users, categories, allergens, ingredients, menu_items, menu_item_ingredients, menu_item_allergens, orders, order_items, chatbot_insights)
- [ ] Create views: `v_menu`, `v_item_ingredients`, `v_item_allergens`, `v_orders`, `v_low_stock`
- [ ] Seed dummy data (categories, allergens, sample menu items)
- [ ] Configure Row Level Security (RLS) policies per role
- [ ] Pre-seed Admin account

### 1.3 Authentication
- [ ] Configure Supabase Auth (email/password + Google OAuth provider)
- [ ] Build `/login` page (form + "Continue with Google" button)
- [ ] Build `/register` page (customer self-registration: name, phone, email, password)
- [ ] Implement Google OAuth callback handler
- [ ] Build "Complete Profile" step (phone + address) for new Google customers
- [ ] Implement role-based redirect after login (admin → `/admin`, cashier → `/cashier`, customer → `/`)
- [ ] Create middleware for protected routes
- [ ] Block Google OAuth for Admin/Cashier roles

---

## Phase 2 — Admin Dashboard

### 2.1 Admin Shell
- [ ] Build `/admin` layout with sidebar navigation (Arabic RTL)
- [ ] Build admin dashboard home with quick stats

### 2.2 Menu Management (`/admin/menu`)
- [ ] List view of all menu items
- [ ] Add Item form (name AR+EN, category, price EGP, photo URL, ingredients, allergens, availability)
- [ ] Edit Item form
- [ ] Remove Item with confirmation
- [ ] Availability toggle

### 2.3 Ingredient & Stock Management (`/admin/ingredients`)
- [ ] List view of all ingredients with stock levels
- [ ] Add Ingredient (name AR+EN, stock_quantity, unit, low_stock_threshold)
- [ ] Edit Ingredient
- [ ] Remove Ingredient
- [ ] Show which menu items use each ingredient

### 2.4 Employee Management (`/admin/employees`)
- [ ] List view of cashier accounts
- [ ] Add Cashier (full name, username, password, status)
- [ ] Edit Cashier details
- [ ] Remove / deactivate Cashier

---

## Phase 3 — Cashier Dashboard

### 3.1 Orders Panel (`/cashier`)
- [ ] Live order list (Supabase realtime subscription)
- [ ] Order card UI (ID, timestamp, type badge, source, items, customer info)
- [ ] Order detail view
- [ ] Status update buttons: Pending → Preparing → Ready → Completed
- [ ] Filter by status / type / source

### 3.2 New Onsite Order (`/cashier/new-order`)
- [ ] Menu item picker (by category)
- [ ] Cart with quantity controls
- [ ] Order type selector: Dine-in (no extra info) / Takeaway (owner name)
- [ ] Confirm & submit → appears in order list

### 3.3 Inventory Alerts
- [ ] Banner at top of cashier dashboard
- [ ] Fetch from `v_low_stock` view
- [ ] Color-coded: Yellow (low) / Red (out of stock)

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
- [ ] Document design tokens in a central reference (e.g. `tailwind.config` or `globals.css`)

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
- [ ] E2E test login flows (all 3 roles + Google OAuth)
- [ ] E2E test admin CRUD operations
- [ ] E2E test cashier order lifecycle
- [ ] E2E test customer chatbot order flow
- [ ] Verify low-stock alerts trigger correctly
- [ ] DevTools MCP testing for UI changes

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
- [ ] Update `CLAUDE.md` and `AGENTS.md`

---

## Out of Scope (v1.0)
Online payment, loyalty program, KDS, multi-branch, mobile app, conversation history logs, analytics dashboard, WhatsApp integration.
