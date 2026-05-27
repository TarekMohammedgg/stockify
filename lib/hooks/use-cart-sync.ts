"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore, type CartItem } from "@/lib/store/cart";

type DbMenuItemJoin = {
  name_ar: string;
  name_en: string;
  price: number;
  photo_url: string | null;
};

type DbCartRow = {
  menu_item_id: string;
  quantity: number;
  notes: string | null;
  menu_items: DbMenuItemJoin | DbMenuItemJoin[] | null;
};

async function loadCartFromDb(userId: string): Promise<CartItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select("menu_item_id, quantity, notes, menu_items(name_ar, name_en, price, photo_url)")
    .eq("user_id", userId);

  if (error) {
    console.error("[useCartSync] load cart", userId, error.message);
    return [];
  }

  const result: CartItem[] = [];
  for (const row of (data ?? []) as DbCartRow[]) {
    const mi = Array.isArray(row.menu_items) ? row.menu_items[0] : row.menu_items;
    if (!mi) continue;
    result.push({
      id: row.menu_item_id,
      name_ar: mi.name_ar,
      name_en: mi.name_en,
      price: mi.price,
      photo_url: mi.photo_url,
      quantity: row.quantity,
      ...(row.notes ? { notes: row.notes } : {}),
    });
  }
  return result;
}

async function syncCartToDb(userId: string, items: CartItem[]) {
  const supabase = createClient();

  if (items.length === 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);
    if (error) console.error("[useCartSync] clear cart", userId, error.message);
    return;
  }

  // Upsert current items
  const rows = items.map((item) => ({
    user_id: userId,
    menu_item_id: item.id,
    quantity: item.quantity,
    notes: item.notes ?? null,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from("cart_items")
    .upsert(rows, { onConflict: "user_id,menu_item_id" });
  if (upsertError) {
    console.error("[useCartSync] upsert cart", userId, upsertError.message);
    return;
  }

  // Delete rows for items no longer in cart
  const activeIds = items.map((i) => i.id);
  const { error: deleteError } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .not("menu_item_id", "in", `(${activeIds.join(",")})`);
  if (deleteError) {
    console.error("[useCartSync] delete stale cart rows", userId, deleteError.message);
  }
}

export function useCartSync(userId: string | null) {
  const { items, setItems, clearCart } = useCartStore();
  const prevUserIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(false);

  // Load or clear when userId changes
  useEffect(() => {
    if (!userId) {
      clearCart();
      prevUserIdRef.current = null;
      return;
    }

    if (userId !== prevUserIdRef.current) {
      prevUserIdRef.current = userId;
      isMountedRef.current = false; // suppress sync on initial load
      loadCartFromDb(userId).then((cartItems) => {
        setItems(cartItems);
        isMountedRef.current = true;
      });
    }
  }, [userId, setItems, clearCart]);

  // Sync to Supabase whenever items change (but not on the initial load)
  useEffect(() => {
    if (!userId || !isMountedRef.current) return;
    syncCartToDb(userId, items);
  }, [items, userId]);
}
