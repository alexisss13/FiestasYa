import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/prisma'; // Importamos prisma directo para la query compleja
import { AddToCartButton } from '@/components/features/AddToCartButton';

interface Props {
  params: Promise<{ slug: string }>;
}

// Helper para obtener producto + hermanos
async function getProductData(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) return null;

  // Buscar hermanos si tiene tag
  let siblings: { slug: string; color: string | null; title: string }[] = [];
  
  if (product.groupTag) {
    siblings = await prisma.product.findMany({
      where: {
        groupTag: product.groupTag,
        isAvailable: true, // Solo mostrar disponibles
        NOT: { id: product.id } // Excluir el actual (opcional, pero mejor incluirlo para la lista completa)
      },
      select: { slug: true, color: true, title: true },
      orderBy: { createdAt: 'asc' } // Ordenar por creación para consistencia
    });
    
    // Agregamos el actual a la lista para mostrar todos los colores
    siblings.push({ slug: product.slug, color: product.color, title: product.title });
    
    // Ordenamos para que siempre salgan en el mismo orden visual
    siblings.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  return { product, siblings };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductData(slug);
  if (!data) return { title: 'Producto no encontrado' };
  return {
    title: `${data.product.title} | FiestasYa`,
    description: data.product.description,
    openGraph: { images: data.product.images[0] ? [data.product.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data) notFound();
  const { product, siblings } = data;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
        
        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-slate-100 shadow-sm">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className={`object-cover ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
              priority 
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">Sin imagen</div>
          )}
          {isOutOfStock && (
             <div className="absolute inset-0 flex items-center justify-center">
                <Badge variant="destructive" className="text-xl px-6 py-2 pointer-events-none">AGOTADO</Badge>
             </div>
          )}
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="flex flex-col justify-center">
          <Badge className="w-fit mb-4" variant="secondary">
            {product.category.name}
          </Badge>
          
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900 lg:text-4xl">
            {product.title}
          </h1>
          
          <div className="mb-6 flex items-baseline gap-4">
             <span className="text-2xl font-bold text-slate-900">{formatPrice(Number(product.price))}</span>
             {isOutOfStock ? <span className="text-sm font-medium text-red-500">Sin stock</span> : (product.stock <= 5 && <span className="text-sm font-medium text-orange-500">¡Quedan solo {product.stock}!</span>)}
          </div>

          {/* 👇 AQUÍ ESTÁ LA MAGIA: SELECTOR DE COLORES */}
          {siblings.length > 0 && (
            <div className="mb-8">
                <p className="text-sm font-medium text-slate-900 mb-3">Colores disponibles:</p>
                <div className="flex flex-wrap gap-3">
                    {siblings.map((variant) => {
                        const isActive = variant.slug === product.slug;
                        return (
                            <Link 
                                key={variant.slug} 
                                href={`/product/${variant.slug}`}
                                title={variant.title}
                                className={`
                                    w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                                    ${isActive ? 'border-slate-900 ring-2 ring-slate-200 ring-offset-1 scale-110' : 'border-slate-200 hover:scale-110 hover:border-slate-400'}
                                `}
                            >
                                {/* Bolita de color */}
                                <span 
                                    className="w-full h-full rounded-full" 
                                    style={{ backgroundColor: variant.color || '#ccc' }} // Gris si no hay color definido
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>
          )}

          <p className="mb-8 text-lg text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Pasamos el producto serializado al cliente */}
          <AddToCartButton product={{...product, price: Number(product.price)}} />
          
          <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm text-slate-500">
             <div><span className="block font-medium text-slate-900">Entrega</span>Coordinación inmediata</div>
             <div><span className="block font-medium text-slate-900">Pago</span>Yape, Plin o Transferencia</div>
          </div>
        </div>
      </div>
    </div>
  );
}