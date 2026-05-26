# PRD — Stockify Restaurant Management Website

**Version:** 1.0  
**Date:** May 2026  
**Author:** PM Session  
**Status:** Draft

---

## 1. Overview

Stockify is a web-based restaurant management system built for a small-to-medium Egyptian restaurant. It serves four distinct user roles — **Admin**, **Cashier**, **Delivery**, and **Customer** — each with a dedicated interface routed from a single login screen. The platform is Arabic-first with an English toggle, cash-only, and supports onsite (dine-in), takeaway, and delivery order types.

A Supabase backend powers all four roles. Customers place orders either through an AI **chatbot** (powered by OpenRouter) or manually via a menu UI; the chatbot has live access to menu and ingredient data via internal API routes and remembers lightweight per-customer insights (favourites, phone, address).

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Reduce manual order errors | < 2% order mistakes after 30 days |
| Speed up cashier workflow | Order entry time < 2 min per order |
| Customer self-ordering via chatbot | 30%+ of online orders via chatbot |
| Inventory visibility | Cashier receives low-stock alerts before running out |
| Admin control | 100% of menu/employee changes done via dashboard |

---

## 3. Users & Roles

All four roles share a single `/login` page and are routed to their respective dashboards based on role.

### 3.1 Admin
Restaurant owner or manager. Full system control.

**Can do:**
- View the admin dashboard showing: number of orders by status, number of employees, daily income, monthly income
- Manage menu (add / edit / remove items with photo, price, category, ingredients, allergens)
- Manage ingredients & stock levels
- Manage employee accounts (Cashiers and Delivery staff — add / edit / remove)
- View inventory alerts

### 3.2 Cashier
Front-of-house staff. Operates onsite, takeaway, and delivery order intake.

**Can do:**
- View and manage incoming orders (website + onsite). Handles **onsite** and **takeaway** orders end-to-end.
- Create new orders manually
- Update / create orders and update the status of onsite and takeaway orders (delivery orders are status-updated by the Delivery role)
- Receive low-stock / out-of-stock inventory alerts

**Cannot do:**
- Access admin settings, menu editing, or employee management

### 3.3 Delivery
Delivery staff. Mobile-friendly read + status-update only.

**Can do:**
- View delivery orders assigned to the restaurant
- **Only** update the status of delivery orders (e.g. on-delivery → complete / cancelled)

**Cannot do:**
- Create orders, edit the menu, or modify onsite/takeaway orders

### 3.4 Customer
End user placing an order online via the public-facing website. **Must be logged in to place an order.**

**Can do:**
- Register / Login to their account (email/password or Google OAuth)
- Browse the menu (photos, ingredients, allergens)
- Order via in-website **chatbot widget** OR **manually** by selecting items from the menu
- Choose order type: Delivery or Takeaway
- Provide phone number and delivery address (address/phone may be skipped if order is takeaway/onsite)

**New vs returning customer:**
- **New customer:** the chatbot/order flow collects address or phone number (required only for delivery; for takeaway/onsite either is fine)
- **Already client:** insights (saved phone, address, favourites) are auto-loaded from the customer's account

**Session behavior:**
- Account required — login before ordering
- Chatbot does NOT save full conversation history
- Chatbot saves lightweight insights only: favourite items, phone number, delivery address

---

## 4. User Flows

### 4.1 Login & Role Routing
```
[Login Screen]  ←  All four user roles log in here (single entry point)
    │
    ├── [Email + Password]  (Google auth optional for customers)
    │       ↓
    │   Role check → Admin / Cashier / Delivery / Customer view
    │
    └── [Continue with Google]  ← Customers only
            ↓
        New user? → Complete profile (phone + address)
            ↓
        Customer view

[New Customer via form?]
    └── Register (name, phone, email, password) → Login → Customer view
```

The login screen is the single entry point for all four roles. Admin, Cashier, and Delivery accounts are created by the Admin only and cannot use Google OAuth. Customers can register manually or use Google.

---

### 4.2 Admin Flow
```
Admin Dashboard (home metrics)
├── Number of orders by status (pending / on-delivery / complete / cancelled)
├── Number of employees (cashiers + delivery)
├── Daily income (EGP)
└── Monthly income (EGP)

Admin Sections
├── Menu Management
│   ├── Add Item (name, category, photo, price, ingredients, allergens)
│   ├── Edit Item
│   └── Remove Item
├── Ingredient & Stock Management
│   ├── Add Ingredient
│   ├── Set stock level & low-stock threshold
│   └── Edit / Remove Ingredient
└── Employee Management (Cashiers + Delivery)
    ├── Add Employee (name, username, password, role: cashier|delivery)
    ├── Edit Employee details
    └── Remove Employee
```

---

### 4.3 Cashier Flow
```
Cashier Dashboard
├── Orders Panel
│   ├── Live order list (website orders + manual onsite/takeaway orders)
│   ├── Order detail view (items, type, customer info)
│   ├── Status update buttons: [Pending] → [On-Delivery] → [Complete]  (or [Cancelled])
│   └── Cashier may only update status of ONSITE + TAKEAWAY orders
│       (delivery order status transitions are handled by the Delivery role)
├── New Order (manual)
│   ├── Select items from menu
│   ├── Choose type:
│   │   ├── Onsite (dine-in) → no extra info needed
│   │   ├── Takeaway          → enter order owner name only
│   │   └── Delivery          → enter customer phone + address (if new)
│   └── Confirm & send to order list
└── Inventory Alerts Banner
    └── Shows items below threshold with warning
```

### 4.4 Delivery Flow
```
Delivery Dashboard (mobile-first)
└── Delivery Orders List
    ├── See order items, customer name, phone, address
    └── Status update only:  [Pending] → [On-Delivery] → [Complete]  (or [Cancelled])
        (No create / edit / menu access)
```

---

### 4.5 Customer Flow
```
[Login / Register]
    ↓
Public Website
├── Menu Page (browse by category, photos, ingredients, allergens)
│   └── Manual order: pick items → choose type → checkout
└── Chatbot Widget (bottom-right corner)
    ├── Greets customer by name (from account)
    ├── New customer? → asks for phone + (address if delivery)
    │   Already client? → loads insights (favourites, phone, address) silently
    ├── Asks: Delivery or Takeaway? (onsite = N/A for online orders)
    ├── Pre-fills phone number & address from account (editable)
    ├── Takes order (item selection, quantity, notes)
    ├── Confirms order summary
    └── Submits order → appears in Cashier dashboard (and Delivery dashboard if delivery type)
    
    [Saved Insights — per customer account]
    - Favourite item(s)
    - Phone number
    - Delivery address
```

**Two creation paths for a customer order:**
1. **Via chatbot** — conversational order build (default, recommended).
2. **Manually by customer** — direct menu UI, add items to cart, checkout.

---

## 5. Features Breakdown

### 5.1 Authentication

**Login Methods:**
- **Username + Password** — available for all roles (Admin, Cashier, Customer)
- **Google OAuth (Sign in with Google)** — available for Customers only

**Rules per role:**

| Role | Username/Password | Google OAuth | Account Creation |
|---|---|---|---|
| Admin | ✅ | ❌ | Admin account pre-seeded only |
| Cashier | ✅ | ❌ | Created by Admin via dashboard |
| Customer | ✅ | ✅ | Self-register or Google sign-in |

**Flow details:**
- Single `/login` page with two options: form login + "Continue with Google" button
- After Google OAuth, if customer profile is new → collect missing phone + address before proceeding
- Role-based redirect after any successful login
- Supabase Auth handles both methods (built-in Google OAuth provider + email/password)
- Password hashing handled by Supabase Auth internally
- JWT session managed by Supabase client

---

### 5.2 Admin — Menu Management
| Field | Type | Required |
|---|---|---|
| Item Name (AR + EN) | Text | ✅ |
| Category | Select (e.g. مقبلات، رئيسي، مشروبات) | ✅ |
| Price (EGP) | Number | ✅ |
| Photo | Image upload | ✅ |
| Ingredients | Multi-select / text list | ✅ |
| Allergens | Tags (e.g. gluten, dairy, nuts) | Optional |
| Availability toggle | Boolean | ✅ |

---

### 5.3 Admin — Ingredient & Stock Management
| Field | Details |
|---|---|
| Ingredient name | Arabic + English |
| Current stock | Number + unit (e.g. kg, liters, pieces) |
| Low-stock threshold | Admin-defined number |
| Linked menu items | Which items use this ingredient |

When stock drops below threshold → alert shown in Cashier dashboard.

---

### 5.4 Admin — Employee Management
| Field | Details |
|---|---|
| Full name | Text |
| Username | Unique, used for login |
| Password | Hashed, set by admin |
| Role | Cashier or Delivery |
| Status | Active / Inactive |

### 5.4.1 Admin — Dashboard Metrics
The Admin home page displays at-a-glance KPIs:
- **Orders by status** — counts grouped by pending / on-delivery / complete / cancelled
- **Employees count** — total active cashiers + delivery staff
- **Daily income** — sum of completed orders for the current day (EGP)
- **Monthly income** — sum of completed orders for the current month (EGP)

---

### 5.5 Cashier — Order Management

**Order Card includes:**
- Order ID & timestamp
- Order type: 🟦 Dine-in / 🟨 Takeaway / 🟥 Delivery
- Source: Online (chatbot) / Onsite (manual)
- Items list with quantities
- **Takeaway (onsite):** owner name only
- **Delivery (online):** customer name, phone, delivery address
- Current status with action button

**Order Statuses (per sketch):**
```
Pending → On-Delivery → Complete
                ↘
                 Cancelled  (terminal, reachable from any non-complete state)
```
- **Pending** — order received, not yet dispatched
- **On-Delivery** — out for delivery (delivery orders) / in-progress (onsite/takeaway)
- **Complete** — fulfilled
- **Cancelled** — voided

Only the **Delivery** role can move delivery orders from Pending → On-Delivery → Complete. The Cashier role handles the same transitions for onsite + takeaway orders.

**Inventory Alert Banner:**
- Shown at top of dashboard
- Lists ingredients below threshold
- Color-coded: Yellow (low) / Red (out of stock)

---

### 5.5.1 Delivery — Order Status Panel
- Lists only orders with `type = delivery`
- Each order card shows: items, customer name, phone, address, current status
- Single action: change status (`Pending` → `On-Delivery` → `Complete`, or `Cancelled`)
- No create / edit / menu access

### 5.6 Customer — Public Menu Page
- Filterable by category
- Each item card: photo, name (AR/EN), price, ingredients, allergen badges
- "Order Now" button opens chatbot
- Arabic RTL layout by default, English LTR toggle

---

### 5.7 Customer — Chatbot Widget
- Embedded bottom-right widget on public site
- **Requires customer to be logged in before chatting**
- Powered by OpenRouter API — model: `google/gemini-2.5-flash-lite`
- Conversation in Arabic by default
- **In-memory context by default** = the customer's saved insights (favourites, phone, address) — auto-loaded at chat start
- **Uses internal API requests against Supabase** to fetch live restaurant data: `GET /api/menu`, `GET /api/menu/[id]/ingredients`, etc.
- **Can make orders** — submits structured order via `POST /api/orders`
- Greets customer by name pulled from account
- Pre-fills phone & address from account (customer can override)
- Collects: order type (Delivery/Takeaway), items, notes
- Saves to customer account (insights):
  - `favourite_items[]`
  - `default_address`
- No full conversation logs saved

**Chatbot system prompt behavior:**
- Knows the current menu (fetched from DB)
- Guides user step by step
- Handles modifications (remove onions, extra sauce, etc.)
- Confirms order before submitting
- Responds warmly in Egyptian Arabic dialect

---

## 6. Tech Stack

| Layer | Choice | Detail |
|---|---|---|
| Frontend | Next.js (App Router) | SSR + API routes in one project |
| Styling | Tailwind CSS | RTL support, fast utility classes |
| UI Components | Lucide React | Icon library for all UI icons |
| Backend | Next.js API Routes | `/api/*` endpoints serve chatbot + dashboard |
| Database | Supabase (PostgreSQL) | Hosted DB + realtime + built-in auth |
| Auth | Supabase Auth | Email/password + Google OAuth, JWT sessions |
| AI / Chatbot | OpenRouter API | Model: `google/gemini-2.5-flash-lite` |
| Images | Unsplash (remote URLs) | Modern food photography, no upload needed |
| Hosting | Vercel | Zero-config Next.js deployment |

### Chatbot API Services (Next.js `/api` routes)

The chatbot calls these internal API endpoints to fetch filtered data from Supabase:

| Endpoint | Purpose |
|---|---|
| `GET /api/menu` | Full menu list (name, price, photo, category, availability) |
| `GET /api/menu/[id]/ingredients` | Ingredients + allergens for a specific item |
| `GET /api/insights?user_id=…` | Customer favourite items + saved address for familiar users |
| `POST /api/orders` | Submit a new order from chatbot |
| `GET /api/orders` | Fetch all orders for cashier dashboard |
| `PATCH /api/orders/[id]` | Update order status |

---

## 7. Data Models — Supabase Schema

> Full SQL schema + dummy data: `stockify-supabase-schema.sql`

### users
```
id (UUID PK), name, phone (unique), email, password_hash,
role ENUM(admin|cashier|delivery|customer), address, is_active, created_at
```
> Note: the `role` enum includes **delivery** per the sketch. Schema management is handled by a separate agent; this PRD documents the intent.

### categories
```
id (UUID PK), name_ar, name_en, sort_order
```

### allergens
```
id (UUID PK), name_ar, name_en
```

### ingredients
```
id (UUID PK), name_ar, name_en, stock_quantity,
unit ENUM(kg|liter|piece|gram|ml), low_stock_threshold, created_at
```

### menu_items
```
id (UUID PK), name_ar, name_en, category_id (FK),
price, photo_url (Unsplash), is_available, created_at
```

### menu_item_ingredients  *(junction)*
```
menu_item_id (FK) + ingredient_id (FK) + quantity → PK
```

### menu_item_allergens  *(junction)*
```
menu_item_id (FK) + allergen_id (FK) → PK
```

### orders
```
id (UUID PK), source ENUM(online|onsite), type ENUM(dine-in|takeaway|delivery),
status ENUM(pending|on_delivery|complete|cancelled),
customer_id (FK → users, online orders), owner_name (onsite takeaway),
delivery_address, notes, total_price, created_at, updated_at
```
> Status enum aligned with the sketch: `pending | on_delivery | complete | cancelled`.

### order_items
```
id (UUID PK), order_id (FK), menu_item_id (FK),
quantity, unit_price, notes
```

### chatbot_insights
```
id (UUID PK), user_id (FK unique → users),
favourite_items UUID[], default_address, last_seen
```

### Supabase Views (used by API routes)
| View | Purpose |
|---|---|
| `v_menu` | Menu joined with category names |
| `v_item_ingredients` | Ingredients per menu item |
| `v_item_allergens` | Allergens per menu item |
| `v_orders` | Full order detail with customer info + items JSON |
| `v_low_stock` | Ingredients at or below threshold with alert level |

---

## 8. Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing / Menu page |
| `/login` | Public | All users — username/password or Google OAuth (customers only) |
| `/register` | Public | Customer self-registration only |
| `/admin` | Admin only | Admin dashboard home |
| `/admin/menu` | Admin only | Menu management |
| `/admin/ingredients` | Admin only | Stock management |
| `/admin/employees` | Admin only | Cashier accounts |
| `/cashier` | Cashier only | Orders dashboard (onsite + takeaway + view of all) |
| `/cashier/new-order` | Cashier only | Manual order creation (onsite / takeaway / delivery) |
| `/delivery` | Delivery only | Delivery-orders status-update dashboard |
| `/api/orders` | Internal | Order CRUD |
| `/api/menu` | Internal | Menu CRUD |
| `/api/chat` | Public | Chatbot API handler |

---

## 9. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Language | Arabic (RTL) primary, English toggle |
| Payment | Cash only — no payment gateway needed |
| Mobile | Web-responsive (desktop priority, mobile supported) |
| Performance | Menu page load < 2s |
| Security | Role-based access, hashed passwords, protected API routes |
| Scalability | Designed for 1 branch, extendable to multi-branch later |

---

## 10. Out of Scope (v1.0)

- Online payment / card processing
- Customer accounts / loyalty program
- Kitchen display screen (KDS)
- Multi-branch support
- Mobile app (iOS / Android)
- Full conversation history logs
- Reporting & analytics dashboard
- WhatsApp / external chatbot integration

---


## 11. UI Reference / Wireframes

Source: `project-sketch.png` (project root). Treated as the latest source of truth where it conflicts with prose.

**Sketch summary:**

- **Supabase** sits at the top as the shared backend for all roles.
- **Login** (centered, email/password + Google auth) is the single entry point. It branches outward to four role views: **Admin**, **Cashier**, **Customer**, **Delivery**. A **Chatbot** node hangs off the customer/login cluster — accessible to the customer experience.
- **Order creation paths** (right side of sketch):
  - *Onsite / Delivery / Takeaway* split, with a "new customer" branch (needs address or phone — phone-only is acceptable for takeaway/onsite) and an "already client" branch (uses saved insights).
  - *Create order* node forks into **chatbot** and **manually by customer**.
- **Chatbot node spec (from sketch):**
  - "Have in memory context by default the insights (favourites) of the customer"
  - "Use the API request with Supabase to get access to the data about restaurant like get menu or get ingredients of specific item"
  - "Can make orders"
- **Order status enum (from sketch):** `Pending`, `On-Delivery`, `Complete`, `Cancelled`.
- **Delivery role spec:** "Can only update the status of delivery orders."
- **Cashier role spec:** Onsite / Delivery / Takeaway — updates order status, creates new orders, updates/creates orders or updates the status of orders (just updates onsite and takeaway orders; delivery will be handled by delivery role).
- **Admin role spec:** Shows the dashboard (number of orders with status, number of employees, daily income and monthly income), Menu, Ingredients/Stock.

When implementing screens, refer to the sketch for layout intent. Visual design is otherwise left to the design system (Tailwind v4 + Lucide icons, Arabic-first RTL).

---

## 12. Milestones

| Phase | Deliverable |
|---|---|
| **Phase 1** | Auth + role routing + DB schema |
| **Phase 2** | Admin dashboard (menu + ingredients + employees) |
| **Phase 3** | Cashier dashboard (orders + alerts) + Delivery dashboard (status updates) |
| **Phase 4** | Public menu page (Arabic RTL, photos, filters) + manual customer ordering |
| **Phase 5** | Chatbot widget + OpenRouter API integration (insights memory + Supabase API access) |
| **Phase 6** | QA, RTL polish, bug fixing, deployment |

---

*PRD prepared in collaboration with PM session. All decisions subject to client review and revision.*