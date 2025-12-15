'use client';

import { useCartStore, CartProduct } from '@/store/cart';
import { Product } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
  product: Product;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({ product, disabled, className }: Props) {
  const addProductToCart = useCartStore(state => state.addProductToCart);
  const [added, setAdded] = useState(false);
  
  // Hidratación segura
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lógica de División
  const isFestamas = product.division === 'JUGUETERIA';

  // 🧠 SELECCIÓN DE VARIANTE:
  // Aquí elegimos qué variante del Button usar. 
  // Al pasarle 'festamas' o 'fiestasya', el Button usará el CSS que definimos en el Paso 1.
  const brandVariant = isFestamas ? 'festamas' : 'fiestasya';

  const handleAddToCart = () => {
    const cartProduct: CartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.price),
      quantity: 1,
      image: product.images[0] || '/placeholder.jpg',
      stock: product.stock,
      division: product.division 
    };

    addProductToCart(cartProduct);
    
    setAdded(true);
    toast.success(`${product.title} agregado`);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!mounted) {
    return (
        <Button disabled variant="secondary" className="w-full">
            Cargando...
        </Button>
    );
  }

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={disabled}
      // 👇 IMPORTANTE: Aquí aplicamos la variante.
      // @ts-ignore (Ignora el error de tipado si TS tarda en leer el cambio en button.tsx)
      variant={brandVariant}
      className={cn(
        "w-full font-bold transition-all duration-200", 
        className 
      )} 
    >
      {added ? (
        <span className="flex items-center animate-in fade-in zoom-in duration-300">
             <Check className="mr-2 h-5 w-5" /> ¡Listo!
        </span>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" /> 
          <span className="text-base">Agregar al Carrito</span>
        </>
      )}
    </Button>
  );
}