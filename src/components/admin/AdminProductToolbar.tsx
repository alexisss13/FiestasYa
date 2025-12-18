'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; 
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Category } from '@prisma/client';

interface Props {
  categories: Category[];
}

export const AdminProductToolbar = ({ categories }: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // URL State Manager
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); 
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    // 🧱 LAYOUT GRID ROBUSTO
    // Mobile: 1 columna (flex-col)
    // Tablet/Desktop: Grid de 3 columnas (1 flexible + 2 fijas)
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px_240px] gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      
      {/* 🔍 BUSCADOR (Ocupa el espacio restante) */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input 
          placeholder="Buscar producto..." 
          className="pl-9 w-full bg-slate-50 border-slate-200 focus-visible:ring-slate-400 h-10 transition-all"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* 📂 FILTRO CATEGORÍA (Ancho fijo en desktop) */}
      <div className="w-full">
        <Select 
            defaultValue={searchParams.get('category') || 'all'} 
            onValueChange={(val) => handleFilterChange('category', val)}
        >
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-10 px-3">
            <div className="flex items-center gap-2 text-slate-600 w-full overflow-hidden">
                <Filter className="h-4 w-4 shrink-0" />
                {/* 👇 TRUNCATE: Corta el texto si es muy largo */}
                <span className="truncate text-sm">
                    <SelectValue placeholder="Categoría" />
                </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="truncate max-w-[300px]">
                    {cat.name}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 🔃 ORDENAR (Ancho fijo en desktop) */}
      <div className="w-full">
        <Select 
            defaultValue={searchParams.get('sort') || 'newest'} 
            onValueChange={(val) => handleFilterChange('sort', val)}
        >
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-10 px-3">
            <div className="flex items-center gap-2 text-slate-600 w-full overflow-hidden">
                <ArrowUpDown className="h-4 w-4 shrink-0" />
                <span className="truncate text-sm">
                    <SelectValue placeholder="Ordenar por" />
                </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más Recientes</SelectItem>
            <SelectItem value="oldest">Más Antiguos</SelectItem>
            <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="stock_asc">Stock Crítico</SelectItem>
            <SelectItem value="stock_desc">Mayor Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};