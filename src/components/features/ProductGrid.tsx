'use client';

import { useUIStore } from '@/store/ui';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[]; 
}

export function ProductGrid({ products }: Props) {
  const { currentDivision } = useUIStore();

  // 🛡️ FILTRO: Solo mostramos productos de la tienda activa
  const displayProducts = products.filter(p => p.division === currentDivision);

  if (displayProducts.length === 0) {
    return (
      <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-400 animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
            <PackageOpen className="w-12 h-12 opacity-50 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Sin resultados por aquí</h3>
        <p className="text-sm text-slate-500 max-w-xs text-center mt-1">
            Parece que no hay productos en esta sección. Prueba cambiando de categoría o tienda.
        </p>
      </div>
    );
  }

  return (
    // GRID RESPONSIVO OPTIMIZADO:
    // Mobile: 2 columnas (standard actual)
    // Tablet: 3 columnas
    // Desktop: 4 columnas
    // Wide: 5 columnas
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}