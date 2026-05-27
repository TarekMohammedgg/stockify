# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-27T06:33:02.374Z
> Files: 90 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.prettierrc` (~34 tok)
- `AGENTS.md` — Stockify — Agent Guide (~1135 tok)
- `CLAUDE.md` — OpenWolf (~1830 tok)
- `next.config.ts` — Declares nextConfig with Unsplash remotePatterns (~68 tok)
- `PLAN.md` — Plan: Admin Home Final Touches — Real Data + Clickable Drill-downs (~2275 tok)
- `proxy.ts` — Exports proxy (~626 tok)
- `tasks.md` — Stockify — Build Tasks (~3961 tok)

## .claude/

- `requirements.md` — Stockify — Requirements & Verification Checklist (~277 tok)
- `session.md` — What's Done (~392 tok)
- `settings.json` (~441 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## C:/Users/USER/.claude/

- `settings.json` (~308 tok)

## C:/Users/USER/.claude/plans/

- `1-insights-not-work-bright-pillow.md` — Plan: Fix Chatbot Insights + Mobile Overflow (~1598 tok)
- `glimmering-mixing-tower.md` — Plan: Customer Profile Page (~1027 tok)
- `humble-coalescing-iverson.md` — Plan: Chatbot Insights Overhaul — users_insights + Order Again Button (~1188 tok)
- `i-want-to-add-async-brook.md` — Plan: WhatsApp Chatbot via WaSenderAPI + n8n (~2077 tok)
- `in-status-line-make-steady-hickey.md` — Plan: Set Default Model to Sonnet 4.6 (~165 tok)
- `jazzy-cuddling-steele.md` — Plan: Admin Home Final Touches — Real Data + Clickable Drill-downs (~2662 tok)
- `peaceful-purring-naur.md` — Plan: Phase 5 — Chatbot Widget + OpenRouter Integration (~1204 tok)

## app/

- `globals.css` — Styles: 17 rules, 53 vars (~1684 tok)
- `layout.tsx` — almarai (~300 tok)
- `page.tsx` — HomePage (~202 tok)

## app/(auth)/complete-profile/

- `page.tsx` — CompleteProfilePage — renders form (~968 tok)

## app/(auth)/login/

- `page.tsx` — LoginForm — renders form (~1927 tok)

## app/(auth)/register/

- `page.tsx` — RegisterPage — renders form (~1624 tok)

## app/admin/

- `layout.tsx` — AdminLayout (~293 tok)
- `loading.tsx` — Loading (~647 tok)
- `page.tsx` — dynamic (~3359 tok)

## app/admin/customers/

- `customers-list.tsx` — formatRelative (~4290 tok)
- `page.tsx` — dynamic (~600 tok)

## app/admin/employees/

- `loading.tsx` — Loading (~502 tok)
- `manager.tsx` — ROLE_LABEL — renders form (~3876 tok)
- `page.tsx` — dynamic (~788 tok)

## app/admin/ingredients/

- `loading.tsx` — Loading (~682 tok)
- `manager.tsx` — UNIT_LABELS — renders form (~4101 tok)
- `page.tsx` — dynamic (~940 tok)

## app/admin/menu/

- `loading.tsx` — Loading (~648 tok)
- `menu-form.tsx` — MenuForm — renders form (~2923 tok)
- `page.tsx` — dynamic (~1828 tok)
- `row-actions.tsx` — MenuRowActions (~518 tok)

## app/admin/menu/[id]/

- `page.tsx` — EditMenuItemPage (~691 tok)

## app/admin/menu/new/

- `page.tsx` — NewMenuItemPage (~502 tok)

## app/admin/orders/

- `loading.tsx` — Loading (~180 tok)
- `orders-panel.tsx` — STATUS_LABELS (~4749 tok)
- `page.tsx` — dynamic (~152 tok)

## app/admin/revenue/

- `page.tsx` — dynamic (~2563 tok)

## app/api/chat/

- `route.ts` — Next.js API route: POST (~2859 tok)

## app/api/chat/extract-insights/

- `route.ts` — Next.js API route: POST (~1714 tok)

## app/api/insights/

- `route.ts` — Next.js API route: GET, PATCH (~550 tok)

## app/api/menu/

- `route.ts` — Next.js API route: GET (~150 tok)

## app/api/menu/[id]/ingredients/

- `route.ts` — Next.js API route: GET (~362 tok)

## app/api/orders-refresh/

- `route.ts` — Next.js API route: GET (~58 tok)

## app/api/orders/

- `route.ts` — Next.js API route: GET, POST (~782 tok)

## app/api/orders/[id]/

- `route.ts` — Next.js API route: PATCH (~334 tok)

## app/auth/callback/

- `route.ts` — Next.js API route: GET (~580 tok)

## app/cashier/

- `layout.tsx` — Mark — renders form (~1040 tok)
- `orders-panel.tsx` — STATUS_LABELS (~3459 tok)
- `page.tsx` — CashierHomePage (~89 tok)

## app/cashier/new-order/

- `order-form.tsx` — OrderForm (~6461 tok)
- `page.tsx` — NewOrderPage (~275 tok)

## app/delivery/

- `delivery-panel.tsx` — STATUS_LABELS (~4985 tok)
- `layout.tsx` — DeliveryLayout — renders form (~528 tok)
- `loading.tsx` — DeliveryLoading (~660 tok)
- `page.tsx` — DeliveryPage (~123 tok)

## app/menu/

- `page.tsx` — MenuPage (~934 tok)

## app/profile/

- `page.tsx` — ProfilePage (~330 tok)
- `page.tsx` — ProfilePage (~447 tok)
- `profile-form.tsx` — ProfileForm — Client Component; editable personal info + read-only chatbot insights; calls updateProfile server action (~700 tok)
- `profile-form.tsx` — getInitials (~2938 tok)

## components/admin/

- `sidebar.tsx` — nav — renders form (~1990 tok)

## components/public/

- `cart-widget.tsx` — CartWidget — renders modal (~1454 tok)
- `chatbot-widget.tsx` — MarkdownComponents (~3897 tok)
- `landing-page.tsx` — COPY (~5273 tok)
- `public-menu.tsx` — PublicMenu (~3474 tok)
- `site-header.tsx` — getInitials — renders form (~1851 tok)

## docs/

- `PRD.md` — PRD — Stockify Restaurant Management Website (~4981 tok)
- `SUPABASE_SCHEMA.md` — STOCKIFY — Supabase PostgreSQL Schema + Dummy Data (~7377 tok)

## lib/

- `time.ts` — Cairo timezone helpers — robust to DST (Egypt is +02 winter / +03 summer (~358 tok)

## lib/actions/

- `admin.ts` — API routes: GET (13 endpoints) (~4120 tok)
- `auth.ts` — API routes: GET (9 endpoints) (~892 tok)
- `cashier.ts` — Exports OrderStatus, OrderItem, Order, LowStockItem + 7 more (~1647 tok)
- `delivery.ts` — Exports DeliveryStatus, OrderItem, DeliveryOrder, listDeliveryOrders, updateDeliveryOrderStatus (~998 tok)
- `profile.ts` — Exports updateProfile (~320 tok)

## lib/chatbot/

- `system-prompt.ts` — Exports MenuItemForPrompt, InsightsForPrompt, buildSystemPrompt (~854 tok)

## lib/hooks/

- `use-cart-sync.ts` — useCartSync(userId) hook: loads cart from Supabase on mount/userId change, syncs mutations back (~80 tok)
- `use-cart-sync.ts` — Exports useCartSync (~957 tok)

## lib/store/

- `cart.ts` — Exports CartItem, useCartStore (~441 tok)

## lib/supabase/

- `client.ts` — Exports createClient (~62 tok)
- `server.ts` — Exports createClient (~202 tok)

## supabase/

- `schema.sql` — Database schema (~2673 tok)
