import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductsByCategory } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';
import { PartyPopper, SearchX } from 'lucide-react';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// 1. SEO Dinámico
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  return {
    title: `${title} | FiestasYa`,
    description: `Compra los mejores artículos de ${slug} en Trujillo.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProductsByCategory(slug);

  if (!data) {
    notFound();
  }

  const { categoryName, products } = data;

  return (
    <div className="container mx-auto px-4 py-12">
      
      {/* CABECERA CON BRANDING */}
      <div className="mb-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 capitalize md:text-5xl">
          {categoryName}
        </h1>
        {/* Línea decorativa de marca */}
        <div className="mt-4 h-1.5 w-24 rounded-full bg-primary shadow-sm"></div>
        
        <p className="mt-4 text-lg text-slate-500 max-w-2xl">
          Explora nuestra colección exclusiva de {categoryName.toLowerCase()} y encuentra justo lo que necesitas.
        </p>
      </div>

      {/* RESULTADOS */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-700">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // ESTADO VACÍO MEJORADO
        <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 animate-in zoom-in-95">
            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                {categoryName.toLowerCase().includes('globo') ? (
                    <PartyPopper className="h-10 w-10 text-slate-300" />
                ) : (
                    <SearchX className="h-10 w-10 text-slate-300" />
                )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¡Pronto tendremos novedades!</h3>
            <p className="text-slate-500 max-w-md px-4">
              Estamos reponiendo el stock de <strong>{categoryName}</strong>. Vuelve a visitarnos pronto para ver los nuevos ingresos.
            </p>
        </div>
      )}
    </div>
  );
}