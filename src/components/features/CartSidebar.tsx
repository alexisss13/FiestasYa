'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cart';

interface Props {
  children: React.ReactNode; 
}

export function CartSidebar({ children }: Props) {
  // ⚠️ CAMBIO AQUÍ: Usamos getSubtotalPrice en lugar de getTotalPrice
  const { items, removeItem, updateQuantity, getSubtotalPrice } = useCartStore();

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent className="flex w-full flex-col pl-6 pr-0 sm:max-w-lg">
        <SheetHeader className="px-1 text-left">
          <SheetTitle>Mi Carrito ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-2 pr-6">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <span className="text-lg font-medium text-slate-500">
              El carrito está vacío
            </span>
            <SheetClose asChild>
                <Button variant="link" className="text-slate-900">
                    Seguir comprando
                </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* LISTA DE ITEMS */}
            <div className="flex-1 overflow-y-auto pr-6">
              <div className="flex flex-col gap-5 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    
                    <SheetClose asChild>
                        <Link href={`/product/${item.slug}`} className="relative h-20 w-20 min-w-[5rem] overflow-hidden rounded-md border bg-slate-100 block hover:opacity-80 transition-opacity">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                        </Link>
                    </SheetClose>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between text-base font-medium text-slate-900">
                        <SheetClose asChild>
                            <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-normal hover:underline hover:text-primary">
                                {item.title}
                            </Link>
                        </SheetClose>
                        
                        <p className="ml-4 font-bold whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      
                      <div className="flex flex-1 items-end justify-between text-sm mt-2">
                        <div className="flex items-center gap-2 rounded-md border p-1 h-8">
                            <Button variant="ghost" size="icon" className="h-5 w-5" 
                                disabled={item.quantity <= 1}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs w-4 text-center">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5" 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-red-500 hover:bg-transparent hover:text-red-600"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="pr-6 pt-4 pb-6">
              <Separator className="my-4" />
              <div className="mb-4 flex justify-between text-base font-medium text-slate-900">
                <p>Subtotal</p>
                {/* ⚠️ CAMBIO AQUÍ: Llamada a la función correcta */}
                <p>{formatPrice(getSubtotalPrice())}</p>
              </div>
              <p className="mt-0.5 mb-4 text-sm text-slate-500">
                El envío se calcula al coordinar.
              </p>
              
              <div className="grid gap-2">
                <SheetClose asChild>
                  <Button asChild className="w-full bg-slate-900 hover:bg-slate-800">
                      <Link href="/cart">
                          Ver Carrito Completo
                      </Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}