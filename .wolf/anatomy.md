# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-31T15:17:08.231Z
> Files: 11 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `proxy.ts` — Session proxy; now allows anonymous access to `/` (exact-match) in addition to /login /register /complete-profile (~644 tok)
- `test-tasks.md` — Test Tasks — Stockify Production Readiness (~2999 tok)

## .claude/


## .claude/rules/


## C:/Users/USER/.claude/


## C:/Users/USER/.claude/plans/

- `agile-petting-starlight.md` — Plan: Stockify Service Landing Page (~689 tok)

## app/

- `page.tsx` — Root route: redirects staff to dashboards, customers to /menu; unauthenticated users see ServiceLandingPage (~80 tok)

## app/(auth)/complete-profile/


## app/(auth)/login/

- `page.tsx` — LoginForm — renders form (~2195 tok)

## app/(auth)/register/


## app/admin/


## app/admin/customers/


## app/admin/employees/


## app/admin/ingredients/


## app/admin/menu/


## app/admin/menu/[id]/


## app/admin/menu/new/


## app/admin/orders/


## app/admin/revenue/


## app/api/chat/


## app/api/chat/extract-insights/


## app/api/insights/


## app/api/menu/


## app/api/menu/[id]/ingredients/


## app/api/orders-refresh/


## app/api/orders/


## app/api/orders/[id]/


## app/api/seed-test-users/


## app/api/storage/sign-upload/

- `route.ts` — POST: generates Supabase signed upload URL via service role; validates file type/size (~120 tok)
- `route.ts` — Next.js API route: POST (~566 tok)

## app/auth/callback/


## app/cashier/


## app/cashier/new-order/


## app/delivery/


## app/menu/

- `page.tsx` — MenuPage (~1019 tok)

## app/profile/


## components/admin/


## components/public/

- `service-landing.tsx` — Service landing page: hero, features, pricing, request form with Supabase PDF upload (~9869 tok)

## docs/


## lib/


## lib/actions/

- `auth.ts` — API routes: GET (11 endpoints) (~1192 tok)
- `request-site.ts` — Exports SiteRequestPayload, submitSiteRequest (~604 tok)

## lib/chatbot/


## lib/hooks/


## lib/store/


## lib/supabase/


## supabase/

