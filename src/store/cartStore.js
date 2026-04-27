import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addPlant: (plant, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.plant.id === plant.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.plant.id === plant.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { plant, quantity }],
          };
        }),
      increment: (plantId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.plant.id === plantId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        })),
      decrement: (plantId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.plant.id === plantId
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item,
          ),
        })),
      removePlant: (plantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.plant.id !== plantId),
        })),
      clearCart: () => set({ items: [] }),
      totalQuantity: () => get().items.reduce((total, item) => total + item.quantity, 0),
      totalTypes: () => get().items.length,
    }),
    {
      name: "greenpick-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
