import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateSubtotal, calculateDiscount, calculateTotal } from '@/lib/cart-calculator'; // 👈 Importamos el cerebro

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  coupon: { code: string; discount: number; type: 'FIXED' | 'PERCENTAGE' } | null;
  
  addItem: (product: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: { code: string; discount: number; type: 'FIXED' | 'PERCENTAGE' }) => void;
  removeCoupon: () => void;
  
  // Getters computados
  getTotalItems: () => number;
  getSubtotalPrice: () => number;    // Renombrado para claridad
  getDiscountAmount: () => number;
  getFinalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product) => {
        const { items } = get();
        const productInCart = items.some((item) => item.id === product.id);

        if (!productInCart) {
          set({ items: [...items, product] });
          return;
        }

        const updatedItems = items.map((item) => {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      removeItem: (productId) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        const updatedItems = items.map((item) => {
          if (item.id === productId) {
            return { ...item, quantity: Math.max(1, quantity) };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [], coupon: null }); // Limpiamos también el cupón
      },

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      // 👇 USAMOS LAS FUNCIONES PURAS Y TESTEADAS
      getSubtotalPrice: () => {
        const { items } = get();
        return calculateSubtotal(items);
      },

      getDiscountAmount: () => {
        const { items, coupon } = get();
        const subtotal = calculateSubtotal(items);
        return calculateDiscount(subtotal, coupon);
      },

      getFinalPrice: () => {
        // Nota: El envío se calcula en el componente UI porque depende de la selección del usuario
        // Aquí devolvemos el total PAGABLE DE PRODUCTOS (Subtotal - Descuento)
        const { items, coupon } = get();
        const subtotal = calculateSubtotal(items);
        const discount = calculateDiscount(subtotal, coupon);
        return calculateTotal(subtotal, discount, 0);
      },

    }),
    {
      name: 'fiestasya-cart',
    }
  )
);