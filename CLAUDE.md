# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# Project Overview 
Stockify is a web-based restaurant management system built for a small-to-medium Egyptian restaurant. It serves three distinct user roles — **Admin**, **Cashier**, and **Customer** — each with a dedicated interface. The platform is Arabic-first with an English toggle, cash-only, and supports dine-in, delivery, and takeaway order types.
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