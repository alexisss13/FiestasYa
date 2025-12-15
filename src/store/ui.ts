import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Division = 'JUGUETERIA' | 'FIESTAS';

interface UIState {
  // 🏪 Tienda Actual
  currentDivision: Division;
  setDivision: (division: Division) => void;

  // 🛒 Carrito Lateral (Sidebar)
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Estado Inicial
      currentDivision: 'JUGUETERIA', // Por defecto arrancamos en Festamas
      isCartOpen: false,

      // Acciones
      setDivision: (division) => set({ currentDivision: division }),
      
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    }),
    {
      name: 'festamas-ui-settings', // Nombre para guardar en localStorage
    }
  )
);