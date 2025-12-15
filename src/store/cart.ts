import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Asegúrate de que esta ruta exista, si no tienes el archivo, avísame y te lo paso.
// Por ahora usaré una lógica interna simple para no romperte si te falta el archivo lib.
import { Product } from '@prisma/client';

export interface CartProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  division: string;
}

interface CartState {
  cart: CartProduct[]; // 👈 Estandarizado: 'cart'
  
  // Actions
  addProductToCart: (product: CartProduct) => void; // 👈 Estandarizado
  removeProduct: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Getters
  getTotalItems: () => number;
  getSubtotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      getTotalItems: () => {
        const { cart } = get();
        return cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
      },

      getSubtotalPrice: () => {
        const { cart } = get();
        return cart ? cart.reduce((subTotal, item) => (item.quantity * item.price) + subTotal, 0) : 0;
      },

      addProductToCart: (product: CartProduct) => {
        const { cart } = get();
        
        // Safety Check: Aseguramos que cart sea un array
        const currentCart = cart || []; 

        const productInCart = currentCart.some(item => item.id === product.id);

        if (!productInCart) {
          set({ cart: [...currentCart, product] });
          return;
        }

        const updatedCart = currentCart.map(item => {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + product.quantity };
          }
          return item;
        });

        set({ cart: updatedCart });
      },

      updateProductQuantity: (productId: string, quantity: number) => {
        const { cart } = get();
        const updatedCart = cart.map(item => {
          if (item.id === productId) {
            return { ...item, quantity: Math.max(1, quantity) }; // Mínimo 1
          }
          return item;
        });
        set({ cart: updatedCart });
      },

      removeProduct: (productId: string) => {
        const { cart } = get();
        const updatedCart = cart.filter(item => item.id !== productId);
        set({ cart: updatedCart });
      },

      clearCart: () => {
        set({ cart: [] });
      },
    }),
    {
      name: 'festamas-cart-storage', // ⚠️ Cambié el nombre para limpiar caché vieja corrupta
    }
  )
);