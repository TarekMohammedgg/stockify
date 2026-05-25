# PRD — Stockify Restaurant Management Website

**Version:** 1.0  
**Date:** May 2026  
**Author:** PM Session  
**Status:** Draft

---

## 1. Overview

Stockify is a web-based restaurant management system built for a small-to-medium Egyptian restaurant. It serves three distinct user roles — **Admin**, **Cashier**, and **Customer** — each with a dedicated interface. The platform is Arabic-first with an English toggle, cash-only, and supports dine-in, delivery, and takeaway order types.

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

### 3.1 Admin
Restaurant owner or manager. Full system control.

**Can do:**
- Manage menu (add / edit / remove items with photo, price, category, ingredients, allergens)
- Manage ingredients & stock levels
- Manage cashier employee accounts (add / edit / remove)
- View inventory alerts

### 3.2 Cashier
Front-of-house or delivery staff. Operational access only.

**Can do:**
- View and manage all incoming orders (website + onsite)
- Update order status (Pending → Preparing → Ready → Delivered/Completed)
- Create manual onsite orders (dine-in / takeaway)
- Receive low-stock / out-of-stock inventory alerts

**Cannot do:**
- Access admin settings, menu editing, or employee management

### 3.3 Customer
End user placing an order online via the public-facing website. **Must be logged in to place an order.**

**Can do:**
- Register / Login to their account
- Browse the menu (photos, ingredients, allergens)
- Order via in-website chatbot widget
- Choose order type: Delivery or Takeaway
- Provide phone number and delivery address

**Session behavior:**
- Account required — login before ordering
- Chatbot does NOT save full conversation history
- Chatbot saves lightweight insights only: favourite items, phone number, delivery address

---

## 4. User Flows

### 4.1 Login & Role Routing
```
[Login Screen]  ←  All three user types log in here
    │
    ├── [Username + Password]
    │       ↓
    │   Role check → Admin / Cashier / Customer view
    │
    └── [Continue with Google]  ← Customers only
            ↓
        New user? → Complete profile (phone + address)
            ↓
        Customer view

[New Customer via form?]
    └── Register (name, phone, email, password) → Login → Customer view
```

The login screen is the single entry point. Admin and Cashier accounts are created by the Admin only and cannot use Google OAuth. Customers can register manually or use Google.

---

### 4.2 Admin Flow
```
Admin Dashboard
├── Menu Management
│   ├── Add Item (name, category, photo, price, ingredients, allergens)
│   ├── Edit Item
│   └── Remove Item
├── Ingredient & Stock Management
│   ├── Add Ingredient
│   ├── Set stock level & low-stock threshold
│   └── Edit / Remove Ingredient
└── Employee Management (Cashiers)
    ├── Add Cashier (name, username, password)
    ├── Edit Cashier details
    └── Remove Cashier
```

---

### 4.3 Cashier Flow
```
Cashier Dashboard
├── Orders Panel
│   ├── Live order list (website orders + manual onsite orders)
│   ├── Order detail view (items, type, customer info)
│   └── Status update buttons: [Pending] → [Preparing] → [Ready] → [Done]
├── New Onsite Order
│   ├── Select items from menu
│   ├── Choose type:
│   │   ├── Dine-in   → no extra info needed
│   │   └── Takeaway  → enter order owner name only
│   └── Confirm & send to order list
└── Inventory Alerts Banner
    └── Shows items below threshold with warning
```

---

### 4.4 Customer Flow
```
[Login / Register]
    ↓
Public Website
├── Menu Page (browse by category, photos, ingredients, allergens)
└── Chatbot Widget (bottom-right corner)
    ├── Greets customer by name (from account)
    ├── Asks: Delivery or Takeaway?
    ├── Pre-fills phone number & address from account (editable)
    ├── Takes order (item selection, quantity, notes)
    ├── Confirms order summary
    └── Submits order → appears in Cashier dashboard
    
    [Saved Insights — per customer account]
    - Favourite item(s)
    - Phone number
    - Delivery address
```

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
| Role | Fixed: Cashier |
| Status | Active / Inactive |

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

**Order Statuses:**
```
Pending → Preparing → Ready → Completed
```

**Inventory Alert Banner:**
- Shown at top of dashboard
- Lists ingredients below threshold
- Color-coded: Yellow (low) / Red (out of stock)

---

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
- Greets customer by name pulled from account
- Pre-fills phone & address from account (customer can override)
- Collects: order type (Delivery/Takeaway), items, notes
- Submits structured order to backend → Cashier dashboard
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
role ENUM(admin|cashier|customer), address, is_active, created_at
```

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
status ENUM(pending|preparing|ready|completed|cancelled),
customer_id (FK → users, online orders), owner_name (onsite takeaway),
delivery_address, notes, total_price, created_at, updated_at
```

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
| `/cashier` | Cashier only | Orders dashboard |
| `/cashier/new-order` | Cashier only | Manual onsite order creation |
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


## 12. Milestones

| Phase | Deliverable |
|---|---|
| **Phase 1** | Auth + role routing + DB schema |
| **Phase 2** | Admin dashboard (menu + ingredients + employees) |
| **Phase 3** | Cashier dashboard (orders + alerts) |
| **Phase 4** | Public menu page (Arabic RTL, photos, filters) |
| **Phase 5** | Chatbot widget + OpenRouter API integration |
| **Phase 6** | QA, RTL polish, bug fixing, deployment |

---

*PRD prepared in collaboration with PM session. All decisions subject to client review and revision.*