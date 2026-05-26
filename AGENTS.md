# Stockify — Agent Guide

Stockify is a web-based restaurant management system for a small-to-medium Egyptian restaurant. Arabic-first (RTL), cash-only, four roles (Admin / Cashier / Delivery / Customer) entering through a single `/login` page. Full product context lives in [`CLAUDE.md`](./CLAUDE.md) and [`docs/PRD.md`](./docs/PRD.md). **Read `CLAUDE.md` first** — it is the single source of truth for code conventions and pinned versions.

---

## Pinned versions (do not drift without a bump task)

- Next.js **16.2.6** (App Router) · React **19.2.4** · TypeScript **^5**
- Tailwind CSS **v4** (`@tailwindcss/postcss`) · lucide-react for icons · Zustand ^5
- Supabase JS ^2 + `@supabase/ssr` ^0.10 · Auth via Supabase Auth
- AI: OpenRouter, model `google/gemini-2.5-flash-lite`
- Hosting: Vercel (Node 24 LTS default)

---

## Slash commands

| Command           | When to use                                  | What it does                                                                 |
|-------------------|----------------------------------------------|------------------------------------------------------------------------------|
| `/steer`          | Project start / new milestone (rare)         | Reads `docs/`, conflict-checks, rewrites `CLAUDE.md` + `AGENTS.md`.          |
| `/steer-tasks`    | Project start (after `/steer`)               | Reads memory, clarifies scope, writes structured `tasks.md`.                 |
| `/plan`           | Before any MEDIUM or HARD task               | Produces a structured plan. **Wait for approval before coding.**             |
| `/collect-garp`   | Mid-project, anytime                         | Audits all previous tasks; blocks progress if anything is incomplete.        |
| `spawn agents N`  | When parallel work helps                     | Max **4** agents; the last agent is always the **reviewer** and never codes. |

Complexity → workflow:
- **EASY** → IMPLEMENTATION → REVIEW
- **MEDIUM / HARD** → PLAN → IMPLEMENTATION → REVIEW (run `/plan` first)

---

## Hard rules (must follow every session)

1. **OpenWolf protocol** — see `.wolf/OPENWOLF.md`.
   - Check `.wolf/anatomy.md` before reading any project file.
   - Check `.wolf/cerebrum.md` before generating code (especially the Do-Not-Repeat list).
   - Check `.wolf/buglog.json` before fixing any error; log new bugs after fixing.
   - Append a one-line entry to `.wolf/memory.md` after each significant action.
   - Update `.wolf/anatomy.md` whenever files are created, deleted, or renamed.
2. **Order status enum** is exactly `pending | on_delivery | complete | cancelled`. No `preparing` or `ready`.
3. **User role enum** includes `delivery`. Staff (admin/cashier/delivery) log in with **email + password** only — no Google OAuth.
4. **RTL-first**: logical CSS properties only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`). Never `left` / `right`.
5. **Tailwind v4 only**, no hex colors in classes, no hand-rolled SVG icons (use `lucide-react`), dark mode via `dark:` variant.
6. **Server actions** live in `lib/actions/*` with `"use server"`. Use the shared Supabase factories in `lib/supabase/`.
7. **Error logs** include function name + relevant IDs.
8. **Don't create docs files** unless explicitly asked.
9. **Keep `CLAUDE.md` and `AGENTS.md` ≤ 200 lines** and consistent with each other.

---

## QA expectations

- Use the **Chrome DevTools MCP** to drive the browser for any non-trivial UI change. Type-check + lint passing is not proof the feature works.
- After UI work, optionally run `openwolf designqc` for sectioned screenshots in `.wolf/designqc-captures/`.

---

## Tool preferences

- **Supabase MCP** for schema introspection (`list_tables`), advisors, logs, and migrations on the remote project. Prefer reading first (`list_tables`, `get_advisors`, `get_logs`) before `apply_migration`.
- **Chrome DevTools MCP** for E2E browser verification, screenshots, console + network checks.
- **Glob / Grep** over Bash `find`/`rg`. **Read** over `cat`. **Edit** over `sed`.
- Reach for the `frontend-design` or `impeccable` skill when the task is visual / UX-shaping.

---

## Things this project does NOT have (do not invent)

- No payment gateway (cash only).
- No KDS, no multi-branch, no mobile apps, no loyalty program.
- No saved chatbot conversation history — only lightweight insights (`favourite_items`, `default_address`, phone).
- No custom username field — Supabase Auth uses email.

For the full rule set, deeper product context, and the Resources list, read [`CLAUDE.md`](./CLAUDE.md).
