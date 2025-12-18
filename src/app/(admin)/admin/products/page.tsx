import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Plus, Pencil, Package, Layers, Users, Tag as TagIcon, TrendingDown, FileSpreadsheet } from 'lucide-react'; // 👈 Cambiado Zap por FileSpreadsheet
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProducts } from '@/actions/products';
import { DeleteProductBtn } from './DeleteProductBtn';
import { getAdminDivision } from '@/actions/admin-settings';
import { cn, formatCurrency } from '@/lib/utils';
import { AdminProductToolbar } from '@/components/admin/AdminProductToolbar';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const selectedDivision = await getAdminDivision();
  const params = await searchParams;

  // 📥 Parseo de Filtros
  const page = Number(params.page) || 1;
  const query = params.q as string || '';
  const categoryId = params.category as string || undefined;
  const sort = params.sort as string || 'newest';

  // 🔍 Fetch Data (Server Action)
  const { data: products, meta } = await getProducts({ 
    includeInactive: true,
    division: selectedDivision,
    page,
    take: 12,
    query,
    categoryId,
    sort
  });

  // Traer categorías para el filtro del toolbar
  const categories = await prisma.category.findMany({
    where: { division: selectedDivision },
    orderBy: { name: 'asc' }
  });
  
  const isFestamas = selectedDivision === 'JUGUETERIA';

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      
      {/* HEADER + ACCIONES */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Inventario</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión: <span className={cn(
              "font-bold px-2 py-0.5 rounded-md text-xs uppercase",
              isFestamas ? "bg-festamas-primary/10 text-festamas-primary" : "bg-fiestasya-accent/10 text-fiestasya-accent"
            )}>{selectedDivision}</span>
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            {/* ⚡ BOTÓN CARGA RÁPIDA (Bulk) */}
            <Button asChild variant="secondary" className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm h-11 border border-slate-200">
                <Link href="/admin/products/bulk">
                    {/* 👇 Icono Spreadsheet (Hoja de cálculo) = Profesional */}
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-slate-500" />
                    <span className="font-semibold">Carga Masiva</span>
                </Link>
            </Button>

            {/* + BOTÓN NUEVO */}
            <Button asChild className={cn("flex-1 md:flex-none text-white h-11 shadow-md", isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90")}>
                <Link href="/admin/products/new">
                    <Plus className="mr-2 h-5 w-5" />
                    <span className="font-semibold">Nuevo</span>
                </Link>
            </Button>
        </div>
      </div>

      {/* 🎛️ TOOLBAR (Buscador y Filtros) */}
      <AdminProductToolbar categories={categories} />

      {/* LISTADO RESPONSIVO */}
      <div className="space-y-4 min-h-[400px]">
        {products?.map((product) => (
          <div key={product.id} className={cn("group relative flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300", !product.isAvailable && "opacity-60 grayscale-[0.5] bg-slate-50")}>
             
             {/* 🖼️ IMAGEN */}
             <div className="relative h-48 w-full md:h-40 md:w-40 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                  {product.images[0] ? (
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300"><Package className="h-10 w-10 opacity-20" /></div>
                  )}
                  
                  {product.discountPercentage > 0 && product.isAvailable && (
                    <div className={cn("absolute top-2 left-2 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 animate-in zoom-in duration-300", isFestamas ? "bg-festamas-primary" : "bg-fiestasya-accent")}>
                      <TrendingDown className="h-3 w-3" /> {product.discountPercentage}% OFF
                    </div>
                  )}

                  {!product.isAvailable && <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]"><span className="text-white text-[10px] font-bold uppercase tracking-widest">Archivado</span></div>}
             </div>

             {/* 📝 INFO */}
             <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-white">SKU: {product.slug.slice(0,8).toUpperCase()}</Badge>
                       <Badge className={cn("text-[10px] font-bold border-none truncate max-w-[150px]", isFestamas ? "bg-festamas-primary/10 text-festamas-primary" : "bg-fiestasya-accent/10 text-fiestasya-accent")}>{product.category?.name || 'Sin Categoría'}</Badge>
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-tight mb-3 truncate">{product.title}</h2>
                    <div className="flex flex-wrap gap-1.5 mb-4 md:mb-0">{product.tags.map(tag => (<span key={tag} className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50"><TagIcon className="h-3 w-3" /> {tag}</span>))}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 border border-slate-100"><Layers className="h-3.5 w-3.5" /></div>
                      <div><p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-0.5">Stock</p><p className={cn("font-bold text-xs", (product.stock || 0) < 5 ? "text-red-500" : "text-slate-700")}>{product.stock || 0} unid.</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 border border-slate-100"><Users className="h-3.5 w-3.5" /></div>
                      <div><p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-0.5">Mayorista</p><p className="font-bold text-xs text-slate-700">{product.wholesalePrice > 0 ? formatCurrency(Number(product.wholesalePrice)) : '-'}</p></div>
                    </div>
                  </div>
             </div>

             {/* 💰 ACCIONES */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:pl-6 md:border-l border-slate-100 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0 w-full md:w-auto">
                  <div className="text-left md:text-right flex-1 md:flex-none"> {/* flex-1 para que empuje en móvil */}
                  <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest mb-0.5">Precio Venta</p>
                  {product.discountPercentage > 0 && <p className="text-xs text-slate-400 line-through font-medium opacity-70">{formatCurrency(Number(product.price))}</p>}
                  <p className={cn("text-2xl md:text-3xl font-black tracking-tight", isFestamas ? "text-festamas-primary" : "text-fiestasya-accent")}>{formatCurrency(Number(product.price) * (1 - product.discountPercentage / 100))}</p>
                  </div>
                  
                  <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200"><Link href={`/admin/products/${product.slug}`}><Pencil className="h-5 w-5" /></Link></Button>
                  {product.isAvailable && <DeleteProductBtn id={product.id} />}
                  </div>
              </div>
          </div>
        ))}
        
        {(!products || products.length === 0) && (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No se encontraron productos.</p>
                <p className="text-xs text-slate-400 mt-2">
                    {query ? `Sin resultados para "${query}"` : 'Esta tienda está vacía.'}
                </p>
                {query && (
                    <Button variant="link" className="text-blue-500 mt-2" asChild>
                        <Link href="/admin/products">Limpiar filtros</Link>
                    </Button>
                )}
            </div>
        )}
      </div>

      {/* 🔄 PAGINACIÓN */}
      <PaginationControls 
        totalPages={meta?.totalPages || 1} 
        currentPage={meta?.page || 1} 
        hasNext={meta?.hasNextPage || false}
        hasPrev={meta?.hasPrevPage || false}
      />
    </div>
  );
}