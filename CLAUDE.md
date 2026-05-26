# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow `.wolf/OPENWOLF.md` every session. Check `.wolf/cerebrum.md` before generating code. Check `.wolf/anatomy.md` before reading files.

---

# Project Overview

Stockify is a web-based restaurant management system for a small-to-medium Egyptian restaurant. It serves **four** user roles — **Admin**, **Cashier**, **Delivery**, and **Customer** — all entering through a single `/login` page and routed to dedicated dashboards by role. The platform is **Arabic-first (RTL)** with an English toggle, **cash-only**, and supports onsite (dine-in), takeaway, and delivery order types.

Key product pillars:
- **Admin** — dashboard KPIs (orders by status, employee count, daily & monthly income); manages menu, ingredients/stock, and employees (cashiers + delivery).
- **Cashier** — handles onsite + takeaway orders end-to-end (create + status). Sees delivery orders but does not transition them.
- **Delivery** — status-update-only role for delivery orders.
- **Customer** — orders via AI chatbot (in-memory insights + live Supabase API) or a manual menu UI.
- **Order statuses** (source of truth): `pending → on_delivery → complete`, with `cancelled` as a terminal branch reachable from any non-complete state.

Canonical UX intent: `docs/PRD.md` (especially §11 "UI Reference / Wireframes") and `project-sketch.png`.

---

# Tech Stack

| Layer            | Choice                          | Version / Detail                                     |
|------------------|---------------------------------|------------------------------------------------------|
| Frontend         | Next.js (App Router)            | **16.2.6** — SSR + API routes in one project         |
| UI Framework     | React                           | **19.2.4**                                           |
| Language         | TypeScript                      | **^5**                                               |
| Styling          | Tailwind CSS                    | **v4** exclusively (`@tailwindcss/postcss`)          |
| UI Icons         | lucide-react                    | All icons via this library                           |
| State (client)   | Zustand                         | ^5                                                   |
| Markdown         | react-markdown + remark-gfm     | Chatbot message rendering                            |
| Backend          | Next.js API Routes              | `/api/*` endpoints serve chatbot + dashboard         |
| Database         | Supabase (PostgreSQL)           | Hosted DB + realtime + Auth                          |
| Auth             | Supabase Auth                   | **Email + password** for all roles; Google OAuth for customers only |
| AI / Chatbot     | OpenRouter API                  | Model: `google/gemini-2.5-flash-lite`                |
| Images           | Unsplash (remote URLs)          | No upload pipeline                                   |
| Hosting          | Vercel                          | Node 24 LTS runtime (Vercel default)                 |
| Node types       | `@types/node`                   | ^20                                                  |

---

# Roles & Auth

| Role     | Login method                  | Account creation                              |
|----------|-------------------------------|-----------------------------------------------|
| Admin    | Email + password              | Seeded manually via Supabase Auth dashboard   |
| Cashier  | Email + password              | Created by Admin                              |
| Delivery | Email + password              | Created by Admin                              |
| Customer | Email + password **or** Google OAuth | Self-register or Google sign-in        |

- Single `/login` page. After successful auth, server action reads `users.role` and redirects: `admin → /admin`, `cashier → /cashier`, `delivery → /delivery`, customer → `/` (or `/complete-profile` if `profile_complete = false`).
- Staff (Admin / Cashier / Delivery) never use Google OAuth.
- `users.role` enum includes **delivery** (per PRD §7). If the deployed Supabase enum is missing it, that is a schema bug to fix — not a code-side workaround.

---

# Data Model — Source of Truth

- Full schema lives in `docs/SUPABASE_SCHEMA.md`.
- **Conflict note**: PRD §7 specifies `order_status ENUM(pending | on_delivery | complete | cancelled)`. The SQL file in `docs/` currently defines a 5-value enum (`pending | preparing | ready | completed | cancelled`). **The PRD wins** — code must use the 4-value enum: `pending`, `on_delivery`, `complete`, `cancelled`. The SQL file needs to be reconciled to match.
- Likewise, `user_role` must include `delivery` (PRD §7).

---

# Code Rules

- **Tailwind CSS v4 only** — no inline `style={}` unless a dynamic value truly requires it.
- **No hardcoded hex colors** in Tailwind classes — use tokens / theme classes.
- **Dark mode**: use the `dark:` variant (respects `prefers-color-scheme`).
- **Icons**: use `lucide-react`. Do not hand-roll inline SVG icons.
- **RTL-first**: this is an Arabic-first app. Use **logical CSS properties** (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) instead of physical `left` / `right`.
- **Error logging**: always include function name + relevant IDs in error logs.
- **Server actions**: keep them in `lib/actions/*` with `"use server"` at the top; never expose Supabase service-role keys to the client.
- **Supabase clients**: use the shared `lib/supabase/server.ts` / `lib/supabase/client.ts` factories — never instantiate `createClient` ad hoc in components.
- **Order status strings**: use the 4-value enum exactly: `pending`, `on_delivery`, `complete`, `cancelled`. No synonyms.
- **No new docs files** unless explicitly requested.

---

# QA

- For end-to-end testing, use the **Chrome DevTools MCP** tool to drive the app yourself.
- After any significant change, run an E2E pass to confirm the golden path and at least one edge case.
- Type checking and lint pass ≠ feature works. Verify in a browser when UI is touched.
- After UI changes, optionally run `openwolf designqc` to capture compressed screenshots into `.wolf/designqc-captures/` and audit them.

---

# Important Rules

- Update `CLAUDE.md` and `AGENTS.md` after **any big change** (new feature, schema change, dependency bump, routing change).
- Keep `CLAUDE.md` and `AGENTS.md` **≤ 200 lines each**.
- Treat the PRD as source of truth for product intent. Treat this file as source of truth for code conventions and pinned versions.
- `CLAUDE.md` and `AGENTS.md` must agree on every rule, version, and convention.

---

# Resources

- `docs/PRD.md` — Product Requirements Document (roles, flows, statuses, milestones).
- `docs/SUPABASE_SCHEMA.md` — full SQL schema + dummy data (note enum reconciliation above).
- `docs/project-structure.json` — generated project layout snapshot.
- `tasks.md` — current build plan (run `/steer-tasks` to (re)generate).
- `.wolf/anatomy.md` — per-file description + token estimates. **Check this before reading any file.**
- `.wolf/cerebrum.md` — preferences, key learnings, Do-Not-Repeat list. **Check before generating code.**
- `.wolf/buglog.json` — known bug log. **Check before fixing any error.**
- `.wolf/memory.md` — session memory append log.
