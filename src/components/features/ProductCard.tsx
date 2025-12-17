'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './AddToCartButton';
import { FavoriteButton } from './FavoriteButton';
import { cn } from '@/lib/utils';
import { Tag, Package } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    price: any;
    stock: number;
    images: string[];
    isAvailable: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wholesalePrice?: any;
    wholesaleMinCount?: number | null;
    discountPercentage: number;
    tags: string[];
    createdAt: Date;
    division?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  
  // Lógica de Tienda
  const isFestamas = product.division === 'JUGUETERIA' || !product.division;
  const brandVariant = isFestamas ? 'festamas' : 'fiestasya';

  const theme = isFestamas 
    ? {
        text: 'text-[#fc4b65]',
        border: 'group-hover:border-[#fc4b65]/50',
        wholesaleBg: 'bg-red-50',
        wholesaleBorder: 'border-red-100',
        wholesaleText: 'text-red-700',
      }
    : {
        text: 'text-[#fb3099]',
        border: 'group-hover:border-[#fb3099]/50',
        wholesaleBg: 'bg-fuchsia-50',
        wholesaleBorder: 'border-fuchsia-100',
        wholesaleText: 'text-fuchsia-700',
      };

  // Precios
  const price = Number(product.price) || 0;
  const wholesalePrice = product.wholesalePrice ? Number(product.wholesalePrice) : 0;
  const discount = product.discountPercentage || 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;
  const isOutOfStock = product.stock <= 0;
  const hasWholesale = wholesalePrice > 0;

  return (
    <Card className={cn(
        "group relative flex flex-col h-full overflow-visible transition-all duration-300 bg-white border border-slate-200",
        "hover:shadow-lg hover:-translate-y-1",
        theme.border
    )}>
      
      {/* 🛡️ CONTENEDOR RELATIVO PARA IMAGEN Y BOTÓN */}
      <div className="relative aspect-square overflow-hidden bg-white rounded-t-lg">
          
          {/* Badges (Izquierda) */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 pointer-events-none">
              {isOutOfStock ? (
                  <Badge variant="secondary" className="bg-slate-900 text-white font-bold px-2 h-5 shadow-sm">
                      AGOTADO
                  </Badge>
              ) : hasDiscount && (
                  // @ts-ignore
                  <Badge variant={brandVariant} className="font-bold px-2 h-5 border-0 shadow-sm flex items-center gap-1">
                      <Tag className="w-3 h-3" /> -{discount}%
                  </Badge>
              )}
          </div>

          {/* ❤️ BOTÓN FAVORITOS (HERMANO DEL LINK, NO HIJO) */}
          {/* Usamos z-30 para asegurarnos que esté encima del Link */}
          <FavoriteButton 
              productId={product.id} 
              className="absolute top-2 right-2 z-30"
          />

          {/* ENLACE AL PRODUCTO */}
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            {product.images[0] ? (
                <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className={cn(
                        "object-contain p-4 transition-transform duration-500 group-hover:scale-105 mix-blend-multiply",
                        isOutOfStock && "opacity-60 grayscale"
                    )}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                    <Package className="w-10 h-10 opacity-20" />
                </div>
            )}
          </Link>
      </div>

      {/* CONTENIDO */}
      <CardContent className="flex flex-col flex-1 p-3 gap-2">
        <div className="flex items-center justify-between">
            <span className={cn("text-[10px] font-extrabold uppercase tracking-widest opacity-80", theme.text)}>
                {isFestamas ? 'Festamas' : 'FiestasYa'}
            </span>
            {!isOutOfStock && product.stock < 5 && (
                <span className="text-[10px] text-orange-500 font-medium">¡Quedan {product.stock}!</span>
            )}
        </div>

        <Link href={`/product/${product.slug}`} title={product.title}>
            <h3 className="text-sm font-medium text-slate-700 leading-tight line-clamp-2 h-[2.5em] group-hover:text-black transition-colors">
                {product.title}
            </h3>
        </Link>

        <div className="mt-auto pt-1">
            <div className="flex items-end gap-2 flex-wrap">
                <span className="text-lg font-bold text-slate-900 leading-none">S/ {finalPrice.toFixed(2)}</span>
                {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through mb-[2px]">S/ {price.toFixed(2)}</span>
                )}
            </div>

            {hasWholesale && !isOutOfStock && (
                 <div className={cn("mt-2 flex items-center justify-between rounded px-2 py-1.5 border", theme.wholesaleBg, theme.wholesaleBorder)}>
                    <div className="flex flex-col leading-none">
                        <span className={cn("text-[9px] font-bold uppercase mb-0.5", theme.wholesaleText)}>Mayorista</span>
                        <span className="text-xs font-bold text-slate-900">S/ {wholesalePrice.toFixed(2)}</span>
                    </div>
                    <div className="text-[9px] font-semibold text-slate-600 bg-white/50 px-1.5 py-0.5 rounded">
                        Min. {product.wholesaleMinCount || 3} un.
                    </div>
                </div>
            )}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <AddToCartButton 
            product={product as any} 
            disabled={isOutOfStock}
            className="w-full h-9 text-xs font-bold shadow-none transition-transform active:scale-95"
        />
      </CardFooter>
    </Card>
  );
}