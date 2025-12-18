import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductWithCategory } from '@/actions/products';

export interface POSCartItem extends ProductWithCategory {
  quantity: number;
}

interface Customer {
  dni: string;
  name: string;
  address: string;
}

interface POSState {
  cart: POSCartItem[];
  customer: Customer;
  
  addToCart: (product: ProductWithCategory) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomer: (customer: Partial<Customer>) => void;
  clearCart: () => void;
  clearCustomer: () => void;
  
  // 🧮 Getters Inteligentes
  getTotal: () => number;
  getItemsCount: () => number;
  // Nuevo: Obtener el precio activo de un item (Normal, Descuento o Mayorista)
  getItemActivePrice: (item: POSCartItem) => number; 
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      cart: [],
      customer: { dni: '', name: '', address: '' },

      addToCart: (product) => {
        const { cart } = get();
        const existing = cart.find(item => item.id === product.id);

        if (existing) {
          if (existing.quantity < existing.stock) {
             set({ cart: cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) });
          }
        } else {
          set({ cart: [...cart, { ...product, quantity: 1 }] });
        }
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter(item => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        const { cart } = get();
        set({ 
            cart: cart.map(item => {
                if (item.id === id) {
                    const newQty = Math.max(1, Math.min(quantity, item.stock));
                    return { ...item, quantity: newQty };
                }
                return item;
            }) 
        });
      },

      setCustomer: (data) => set({ customer: { ...get().customer, ...data } }),
      clearCart: () => set({ cart: [] }),
      clearCustomer: () => set({ customer: { dni: '', name: '', address: '' } }),

      // 🧠 LÓGICA DE PRECIOS
      getItemActivePrice: (item) => {
        const basePrice = Number(item.price);
        let finalPrice = basePrice;

        // 1. Calcular Precio con Descuento (si aplica)
        if (item.discountPercentage > 0) {
            finalPrice = basePrice * (1 - item.discountPercentage / 100);
        }

        // 2. Verificar Mayorista
        const wholesalePrice = Number(item.wholesalePrice || 0);
        const minCount = Number(item.wholesaleMinCount || 999999); // Asegurar número

        // Solo aplicamos mayorista si:
        // - Existe precio mayorista (> 0)
        // - Cantidad comprada cumple el mínimo
        // - El precio mayorista es MEJOR (menor) que el precio actual (base o descuento)
        if (wholesalePrice > 0 && item.quantity >= minCount) {
            if (wholesalePrice < finalPrice) {
                finalPrice = wholesalePrice;
            }
        }

        return finalPrice;
      },

      getTotal: () => {
        const { cart, getItemActivePrice } = get();
        return cart.reduce((total, item) => total + (getItemActivePrice(item) * item.quantity), 0);
      },

      getItemsCount: () => get().cart.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'festamas-pos-storage',
    }
  )
);