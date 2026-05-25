# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-05-24

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

## Key Learnings

- **Project:** stockify
- **Next.js 16** renamed `middleware.ts` → `proxy.ts` with a named `proxy` export (not `middleware`). No `export const config = { matcher }` allowed — proxy runs on Node.js and intercepts all routes. Guard with path checks inside the function instead.
- **Next.js 16 searchParams** is a Promise. In client components use `useSearchParams()` hook; don't destructure from page props.
- **Supabase SSR** uses `@supabase/ssr` with `createBrowserClient` (client) and `createServerClient` (server/proxy). Cookie handling in server.ts silently ignores `setAll` errors in Server Components (handled by proxy).
- **Tailwind v4** config lives in `globals.css` via `@import "tailwindcss"` + `@theme {}`. No `tailwind.config.js` needed. Surface tokens go in `:root` CSS vars, design tokens in `@theme`.
- **`create-next-app` can't scaffold into a non-empty directory.** Workaround: scaffold to a temp dir, then copy files over (skipping conflicting AGENTS.md / CLAUDE.md).
- **Cairo font** (Google Fonts) via `next/font/google` with `subsets: ["arabic", "latin"]` is the Arabic-first font choice for this project.
- **Role guards** belong in layout Server Components (not proxy) to avoid per-request DB queries on all routes. Proxy only refreshes the session.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-05-25] Used `middleware.ts` instead of `proxy.ts` in Next.js 16 → runtime deprecation warning. Always use `proxy.ts` with `export async function proxy(req)`.
- [2026-05-25] Used `searchParams.error` directly in a client component page prop → runtime error. Always use `useSearchParams()` hook in client components.

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
