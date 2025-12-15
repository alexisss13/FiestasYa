'use client';

import { useCartStore, CartProduct } from '@/store/cart';
import { Product } from '@prisma/client';
import { Button } from '@/components/ui/button'; // Importa el botón actualizado
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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  // Lógica simple: Si es Juguetería -> festamas, Si no -> fiestasya
  const brandVariant = product.division === 'JUGUETERIA' ? 'festamas' : 'fiestasya';

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
    return <Button disabled variant="secondary" className="w-full">Cargando...</Button>;
  }

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={disabled}
      // ⚠️ AQUÍ USAMOS LA VARIANTE NUEVA
      // @ts-ignore (Ignora el error de TS momentáneo)
      variant={brandVariant} 
      className={cn("w-full font-bold transition-all duration-200", className)} 
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