import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategories } from '@/actions/categories';
import { DeleteCategoryBtn } from './DeleteCategoryBtn';
import { getAdminDivision } from '@/actions/admin-settings';
import { cn } from '@/lib/utils';

export default async function CategoriesPage() {
  const selectedDivision = await getAdminDivision();
  const { data: categories } = await getCategories(selectedDivision);
  const isFestamas = selectedDivision === 'JUGUETERIA';

  return (
    // 📱 FIX: Padding responsivo
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Categorías</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organización: <span className={cn(
              "font-bold px-2 py-0.5 rounded-md text-xs uppercase",
              isFestamas ? "bg-festamas-primary/10 text-festamas-primary" : "bg-fiestasya-accent/10 text-fiestasya-accent"
            )}>{selectedDivision}</span>
          </p>
        </div>
        
        {/* 👇 BOTÓN ACTUALIZADO CON COLOR DE MARCA (IGUAL QUE PRODUCTOS) */}
        <Button 
          asChild 
          className={cn(
            "w-full md:w-auto h-11 px-6 shadow-lg transition-all active:scale-[0.98] text-white font-bold",
            isFestamas 
              ? "bg-festamas-primary hover:bg-festamas-primary/90" 
              : "bg-fiestasya-accent hover:bg-fiestasya-accent/90"
          )}
        >
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Categoría
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categories?.map((cat) => (
          <div key={cat.id} className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* 🖼️ ÁREA DE IMAGEN */}
            <div className="relative h-32 md:h-40 w-full bg-slate-100 overflow-hidden">
              {cat.image ? (
                <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 bg-slate-50">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                  <span className="text-[10px] uppercase font-bold tracking-tighter opacity-40">Sin Imagen</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <h3 className="font-bold text-white text-lg md:text-xl capitalize drop-shadow-md truncate max-w-[70%]">
                  {cat.name}
                </h3>
                <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[10px]">
                  {cat._count?.products || 0} ITEMS
                </Badge>
              </div>
            </div>

            {/* 🛠️ ACCIONES */}
            <div className="p-3 md:p-4 flex items-center justify-between bg-white">
              <span className="text-[10px] md:text-[11px] font-mono text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                /{cat.slug}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 md:h-9 md:w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                  <Link href={`/admin/categories/${cat.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteCategoryBtn id={cat.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}