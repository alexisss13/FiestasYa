import Link from 'next/link';
import Image from 'next/image'; // Importante para el Hero con imagen
import { getProducts } from '@/actions/products';
import { getStoreConfig } from '@/actions/settings'; // 👈 Traemos config
import { getBanners } from '@/actions/design'; // 👈 Traemos banners
import { ProductCard } from '@/components/features/ProductCard';
import { Button } from '@/components/ui/button';

export const revalidate = 60; 

export default async function HomePage() {
  // 1. Carga de datos paralela (Ultra rápido)
  const [productsRes, config, banners] = await Promise.all([
    getProducts(),
    getStoreConfig(),
    getBanners(true) // Solo activos
  ]);

  const products = productsRes.data;

  return (
    <main>
      {/* 1. HERO SECTION DINÁMICO */}
      <section className="relative h-[500px] w-full overflow-hidden flex items-center justify-center text-center bg-slate-900">
        {/* Imagen de Fondo Configurable */}
        {config.heroImage ? (
            <Image 
                src={config.heroImage} 
                alt="Hero" 
                fill 
                className="object-cover opacity-60" // Oscurecemos un poco para leer texto
                priority
            />
        ) : (
            // Fallback: Degradado si no hay imagen
            <div className="absolute inset-0 bg-linear-to-r from-secondary to-primary opacity-90" />
        )}
        
        <div className="relative z-10 container px-4">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-7xl">
            {config.heroTitle || "Celebra a lo Grande"}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-white/90 md:text-xl drop-shadow-md">
            {config.heroSubtitle}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-slate-100 text-lg px-8 font-bold shadow-xl border-none">
              <Link href={config.heroButtonLink || "/search?q="}>
                {config.heroButtonText || "Ver Catálogo"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. BANNERS PROMOCIONALES (GRID DINÁMICO) */}
      {banners.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <Link key={banner.id} href={banner.link} className="group relative h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                        <Image 
                            src={banner.image} 
                            alt={banner.title} 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Overlay degradado para leer texto */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">{banner.title}</h3>
                                <span className="text-sm font-semibold text-white/90 bg-primary px-3 py-1 rounded-full">
                                    Ver más
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
          </section>
      )}

      {/* 3. CATÁLOGO (Igual que antes) */}
      <section id="catalogo" className="container mx-auto px-4 py-16">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
            Lo Más Nuevo
          </h2>
          <div className="mt-2 h-1 w-20 rounded-full bg-secondary"></div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-slate-500">Cargando productos...</p>
          </div>
        )}
      </section>
    </main>
  );
}