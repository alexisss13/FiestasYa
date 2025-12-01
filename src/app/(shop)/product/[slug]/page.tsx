import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProduct } from '@/actions/products';
import { getStoreConfig } from '@/actions/settings';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// 1. SEO Dinámico (Vital para que Google te quiera)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Producto no encontrado',
      description: 'El artículo que buscas no existe.',
    };
  }

  return {
    title: `${product.title} | FiestasYa`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  
  // 2. Traemos producto Y configuración en paralelo
  const [product, config] = await Promise.all([
    getProduct(slug),
    getStoreConfig()
  ]);

  if (!product) {
    notFound();
  }

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);

  // 3. Usamos los datos reales
  const whatsappNumber = config.whatsappPhone; // 👈 YA NO ES HARDCODED
  const message = encodeURIComponent(
    `Hola FiestasYa! 🎉 Estoy interesado en el producto: *${product.title}* que vi en la web.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="container mx-auto px-4 py-10">
      {/* ... (El resto del JSX se queda IGUAL) ... */}
      
      {/* Solo verifica que el botón use la variable 'whatsappUrl' que acabamos de crear arriba */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-slate-100 shadow-sm">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              priority 
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Sin imagen
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="flex flex-col justify-center">
          <Badge className="w-fit mb-4" variant="secondary">
            {product.category.name}
          </Badge>
          
          <h1 className="mb-4 text-3xl font-extrabold text-slate-900 lg:text-4xl">
            {product.title}
          </h1>
          
          <div className="mb-6 text-2xl font-bold text-slate-900">
            {formatPrice(product.price)}
          </div>

          <p className="mb-8 text-lg text-slate-600 leading-relaxed">
            {product.description}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            {/* BOTÓN DE ACCIÓN PRINCIPAL */}
            <Button asChild size="lg" className="text-lg w-full sm:w-auto bg-green-600 hover:bg-green-700">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Comprar por WhatsApp 
                <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>
            </Button>
            
            <Button variant="outline" size="lg">
              Seguir viendo
            </Button>
          </div>
          
          <p className="mt-4 text-xs text-slate-500">
            * Coordinamos el pago y envío directamente contigo.
          </p>
        </div>
      </div>
    </div>
  );
}