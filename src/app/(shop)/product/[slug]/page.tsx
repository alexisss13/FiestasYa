import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/prisma';
import { AddToCartButton } from '@/components/features/AddToCartButton';
import { ProductImageGallery } from '@/components/features/ProductImageGallery'; // 👈 Importamos la galería
import { SITE_URL } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProductData(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) return null;

  let siblings: { slug: string; color: string | null; title: string }[] = [];
  
  if (product.groupTag) {
    siblings = await prisma.product.findMany({
      where: {
        groupTag: product.groupTag,
        isAvailable: true,
        NOT: { id: product.id }
      },
      select: { slug: true, color: true, title: true },
      orderBy: { createdAt: 'asc' }
    });
    
    siblings.push({ slug: product.slug, color: product.color, title: product.title });
    siblings.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  return { product, siblings };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductData(slug);
  
  if (!data) {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscas no existe en FiestasYa.'
    };
  }

  const { product } = data;
  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const imageUrl = product.images[0] || `${SITE_URL}/og-image.jpg`;

  return {
    title: `${product.title} | FiestasYa`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.description,
      url: productUrl,
      siteName: 'FiestasYa',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'website',
    },
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
  const productPrice = Number(product.price);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: productPrice,
      priceCurrency: 'PEN',
      availability: isOutOfStock 
        ? 'https://schema.org/OutOfStock' 
        : 'https://schema.org/InStock',
      url: `${SITE_URL}/product/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'FiestasYa'
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
        
        {/* COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES */}
        {/* 👇 AQUÍ ESTÁ EL CAMBIO: Usamos el componente interactivo */}
        <ProductImageGallery 
            images={product.images} 
            title={product.title} 
            isOutOfStock={isOutOfStock} 
        />

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="flex flex-col justify-center">
          <Badge className="w-fit mb-4" variant="secondary">
            {product.category.name}
          </Badge>
          
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900 lg:text-4xl">
            {product.title}
          </h1>
          
          <div className="mb-6 flex items-baseline gap-4">
             <span className="text-2xl font-bold text-slate-900">{formatPrice(productPrice)}</span>
             {isOutOfStock ? <span className="text-sm font-medium text-red-500">Sin stock</span> : (product.stock <= 5 && <span className="text-sm font-medium text-orange-500">¡Quedan solo {product.stock}!</span>)}
          </div>

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
                                <span 
                                    className="w-full h-full rounded-full" 
                                    style={{ backgroundColor: variant.color || '#ccc' }} 
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

          <AddToCartButton product={{...product, price: productPrice}} />
          
          <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm text-slate-500">
             <div><span className="block font-medium text-slate-900">Entrega</span>Coordinación inmediata</div>
             <div><span className="block font-medium text-slate-900">Pago</span>Yape, Plin o Transferencia</div>
          </div>
        </div>
      </div>
    </div>
  );
}