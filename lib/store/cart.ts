import { create } from "zustand";

export interface CartItem {
  id: string; // menu_item_id
  name_ar: string;
  name_en: string;
  price: number;
  photo_url: string | null;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => {
    const currentItems = get().items;
    const existingItem = currentItems.find((i) => i.id === item.id);
    if (existingItem) {
      set({
        items: currentItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ items: [...currentItems, item] });
    }
  },
  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    });
  },
  clearCart: () => set({ items: [] }),
  getTotal: () =>
    get().items.reduce((total, item) => total + item.price * item.quantity, 0),
  getItemCount: () =>
    get().items.reduce((count, item) => count + item.quantity, 0),
}));
