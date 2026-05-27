# Plan: Fix 6 Chatbot Bugs (Audit Results)

## Context
An agent-based audit of the chatbot flow against the workflow diagram (`docs/chatbot-workflow.png`) found 7 issues. The diagram's intended flow (user insights + user info → memory → chatbot; menu on-demand → chatbot → chat UI) is architecturally implemented, but 6 concrete bugs were found that break UX or data integrity. Fix 7 (refactor duplicate order insert logic) is deferred — it works and the server-to-server auth complexity adds risk without user-visible gain.

---

## Files to Change

| File | Lines |
|---|---|
| `components/public/chatbot-widget.tsx` | 119, 104–111, 134–144, 154–159 |
| `app/api/chat/route.ts` | 196, 230, 274–289 |
| `app/api/orders/route.ts` | 37–38 |

---

## Fix 1 — Wrong field name in returning-user greeting (High)

**File:** `components/public/chatbot-widget.tsx:119`

```ts
// BEFORE (broken — field doesn't exist):
data?.data?.favourite_items?.length > 0 || data?.data?.default_address

// AFTER (correct column name):
data?.data?.favourite_items?.length > 0 || data?.data?.user_address
```

---

## Fix 2 — Missing delivery address guard in chat route (High)

**File:** `app/api/chat/route.ts` — after line 196 (after the `items.length === 0` check)

```ts
// ADD after the existing items check at line 196:
if (orderData.type === "delivery" && !orderData.delivery_address) {
  throw new Error("delivery_address missing for delivery order");
}
```

---

## Fix 3 — `favourite_items` overwritten instead of merged (High)

**File:** `app/api/chat/route.ts:274–289`

The current upsert sets `favourite_items: orderedItemNames` (replaces entire array). Fix: fetch existing favourites and merge deduplicated before upsert.

```ts
// REPLACE lines 280-289 with:
const { data: existingInsights } = await supabase
  .from("users_insights")
  .select("favourite_items")
  .eq("user_id", userId)
  .maybeSingle();

const existingFavourites: string[] = existingInsights?.favourite_items ?? [];
const mergedFavourites = Array.from(new Set([...existingFavourites, ...orderedItemNames]));

await supabase.from("users_insights").upsert(
  {
    user_id: userId,
    favourite_items: mergedFavourites,
    ...(deliveryAddress && { user_address: deliveryAddress }),
    ...(customerPhone && { user_phone: customerPhone }),
    last_seen: new Date().toISOString(),
  },
  { onConflict: "user_id" },
);
```

---

## Fix 4 — No auth guard on `POST /api/orders` (High)

**File:** `app/api/orders/route.ts:37–38`

```ts
// ADD at the top of the POST handler, after `const supabase = await createClient();`:
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## Fix 5 — Re-open chat after completed order doesn't start new session (Medium)

**File:** `components/public/chatbot-widget.tsx:134–144`

The `open-chatbot` event handler calls `startNewOrder()` inside a `setOrderId` updater callback (React anti-pattern). Also has stale closure risk. Fix: use a ref to track orderId for the event handler.

```ts
// ADD after inputRef declaration (line 74):
const orderIdRef = useRef<string | null>(null);

// ADD a new useEffect to keep ref in sync with state:
useEffect(() => { orderIdRef.current = orderId; }, [orderId]);

// REPLACE lines 134-144 open-chatbot handler with:
useEffect(() => {
  const handler = () => {
    setIsOpen(true);
    if (orderIdRef.current) startNewOrder();
  };
  window.addEventListener("open-chatbot", handler);
  return () => window.removeEventListener("open-chatbot", handler);
}, [startNewOrder]);
```

---

## Fix 6 — Double insight extraction after order confirmation (Low)

**File:** `components/public/chatbot-widget.tsx:154–159`

After an order is confirmed, the chat route already upserts `users_insights`. The debounced extract-insights effect fires redundantly. Skip it when `orderId` is set.

```ts
// REPLACE lines 153-159 with:
useEffect(() => {
  if (isPending) return;
  if (messages.length < 3) return;
  if (orderId) return;  // chat route already saved insights on order confirm
  const t = setTimeout(() => extractInsights(messages), 1500);
  return () => clearTimeout(t);
}, [messages, isPending, orderId, extractInsights]);
```

---

## Fix 7 — Deferred

Chatbot duplicates `/api/orders` insert logic (low priority). Requires server-to-server auth token forwarding — not worth the refactor risk. Both paths work correctly after fixes 1–6.

---

## Execution Order

Apply fixes in this order (low risk → higher risk):
1. Fix 1 (chatbot-widget.tsx:119) — one character change
2. Fix 6 (chatbot-widget.tsx:154–159) — add one `if` guard
3. Fix 5 (chatbot-widget.tsx:134–144) — event handler refactor
4. Fix 4 (orders/route.ts:37) — add auth guard
5. Fix 2 (chat/route.ts:~196) — add delivery address guard
6. Fix 3 (chat/route.ts:274–289) — favourite_items merge

---

## Verification

1. Open the app as a logged-in customer with past orders
2. Open the chatbot — confirm the returning-user greeting fires (Fix 1)
3. Place a delivery order — confirm it saves correctly with delivery address (Fix 2)
4. Place two orders — confirm `favourite_items` grows (merges) instead of replacing (Fix 3)
5. Try `POST /api/orders` without auth — expect 401 (Fix 4)
6. Close chat after an order, re-open via "Order Now" button — confirm new session starts (Fix 5)
7. Confirm no double network call to `/api/chat/extract-insights` in DevTools after order (Fix 6)
