# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# Project Overview
Stockify is a web-based restaurant management system built for a small-to-medium Egyptian restaurant. It serves **four** distinct user roles — **Admin**, **Cashier**, **Delivery**, and **Customer** — each with a dedicated interface routed from a single `/login` entry point. The platform is Arabic-first (RTL) with an English toggle, cash-only, and supports onsite (dine-in), takeaway, and delivery order types.

Key product pillars:
- **Admin dashboard** surfaces KPIs: orders by status, employee count, daily and monthly income. Admin manages menu, ingredients/stock, and employees (cashiers + delivery).
- **Cashier** handles onsite and takeaway orders end-to-end (create + status). Cashier can see delivery orders but status transitions for them are owned by the Delivery role.
- **Delivery** is a status-update-only role for delivery orders.
- **Customer** orders via either the AI chatbot (with in-memory insights + live Supabase API access for menu/ingredients) or a manual menu UI.
- **Order statuses**: `Pending → On-Delivery → Complete` (with `Cancelled` as a terminal branch).

See `docs/PRD.md` (especially section 11 "UI Reference / Wireframes") and `project-sketch.png` for the canonical UX intent.
# Tech Stack 

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



# Code Rules 
. Tailwind CSS v4 exclusively - no inline style={} unless dynamic values require it.
. Never use hardcoded hex color values in Tailwind classes.
· Dark mode: use dark: variant (respects prefers-color-scheme ).
. Use lucide-react for icons; do not create custom inline SVG icons from scratch.
. RTL: this is an Arabic-first app. Use logical properties instead of physical left / right properties.
. Log errors with sufficient context (function name, relevant IDs). 

# QA 
. For end-to-end testing, always use DevTools MCP tool to test changes yourself.
. If you did a significant change, ensure that your work is clean through an E2E testing.


# Important Rules
- Update CLAUDE.md file and AGENTS.md file after big changes. 
- when update files @CLAUDE.md or @AGENTS.md make the maxline number <= 200 lines . 
