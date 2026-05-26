# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-26T01:12:25.433Z
> Files: 50 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.prettierrc` (~34 tok)
- `AGENTS.md` — Project Overview (~677 tok)
- `CLAUDE.md` — OpenWolf (~735 tok)
- `next.config.ts` — Declares nextConfig with Unsplash remotePatterns (~68 tok)
- `proxy.ts` — Exports proxy (~626 tok)
- `tasks.md` — Stockify — Build Tasks (~3414 tok)

## .claude/

- `settings.json` (~441 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## app/

- `globals.css` — Styles: 17 rules, 53 vars (~1684 tok)
- `layout.tsx` — almarai (~300 tok)
- `page.tsx` — HomePage — renders form (~371 tok)

## app/(auth)/complete-profile/

- `page.tsx` — CompleteProfilePage — renders form (~968 tok)

## app/(auth)/login/

- `page.tsx` — LoginPage — renders form (~1852 tok)

## app/(auth)/register/

- `page.tsx` — RegisterPage — renders form (~1624 tok)

## app/admin/

- `layout.tsx` — AdminLayout (~293 tok)
- `loading.tsx` — Loading (~647 tok)
- `page.tsx` — AdminHomePage (~2750 tok)

## app/admin/employees/

- `loading.tsx` — Loading (~502 tok)
- `manager.tsx` — ROLE_LABEL — renders form (~3876 tok)
- `page.tsx` — dynamic (~788 tok)

## app/admin/ingredients/

- `loading.tsx` — Loading (~682 tok)
- `manager.tsx` — UNIT_LABELS — renders form (~3257 tok)
- `page.tsx` — dynamic (~880 tok)

## app/admin/menu/

- `loading.tsx` — Loading (~648 tok)
- `menu-form.tsx` — MenuForm — renders form (~2923 tok)
- `page.tsx` — dynamic (~1828 tok)
- `row-actions.tsx` — MenuRowActions (~518 tok)

## app/admin/menu/[id]/

- `page.tsx` — EditMenuItemPage (~691 tok)

## app/admin/menu/new/

- `page.tsx` — NewMenuItemPage (~502 tok)

## app/api/orders-refresh/

- `route.ts` — Next.js API route: GET (~58 tok)

## app/auth/callback/

- `route.ts` — Next.js API route: GET (~502 tok)

## app/cashier/

- `layout.tsx` — Mark — renders form (~1040 tok)
- `orders-panel.tsx` — STATUS_LABELS (~3459 tok)
- `page.tsx` — CashierHomePage (~89 tok)

## app/cashier/new-order/

- `order-form.tsx` — OrderForm (~3793 tok)
- `page.tsx` — NewOrderPage (~275 tok)

## app/delivery/

- `delivery-panel.tsx` — STATUS_LABELS (~3678 tok)
- `layout.tsx` — DeliveryLayout — renders form (~528 tok)
- `loading.tsx` — DeliveryLoading (~660 tok)
- `page.tsx` — DeliveryPage (~77 tok)

## components/admin/

- `sidebar.tsx` — PendingDot — renders form (~1880 tok)

## docs/

- `PRD.md` — PRD — Stockify Restaurant Management Website (~4981 tok)
- `SUPABASE_SCHEMA.md` — STOCKIFY — Supabase PostgreSQL Schema + Dummy Data (~7377 tok)

## lib/actions/

- `admin.ts` — API routes: GET (19 endpoints) (~2619 tok)
- `auth.ts` — API routes: GET (8 endpoints) (~812 tok)
- `cashier.ts` — Exports OrderStatus, OrderItem, Order, LowStockItem + 5 more (~1350 tok)
- `delivery.ts` — Exports DeliveryStatus, OrderItem, DeliveryOrder, listDeliveryOrders, updateDeliveryOrderStatus (~921 tok)

## lib/supabase/

- `client.ts` — Exports createClient (~62 tok)
- `server.ts` — Exports createClient (~202 tok)

## supabase/

- `schema.sql` — Database schema (~2469 tok)
