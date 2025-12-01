import { redirect } from 'next/navigation';
import { getProducts } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';
import { SearchX } from 'lucide-react';

interface Props {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const metadata = {
  title: 'Resultados de búsqueda | FiestasYa',
  description: 'Encuentra los mejores artículos para tu fiesta.',
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || '';

  // Si no hay búsqueda, redirigir al home o mostrar vacío
  if (!query) {
    redirect('/');
  }

  const { data: products } = await getProducts({ query });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Resultados para &quot;{query}&quot;
        </h1>
        <p className="text-slate-500 mt-1">
          Se encontraron {products?.length || 0} productos.
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-100 p-6 rounded-full mb-4">
            <SearchX className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No encontramos nada</h2>
          <p className="text-slate-500 max-w-md">
            Intenta con otras palabras clave o revisa la ortografía. 
            Prueba buscando "globos", "velas" o "pack".
          </p>
        </div>
      )}
    </div>
  );
}