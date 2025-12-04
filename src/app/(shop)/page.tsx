import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/actions/products';
import { getStoreConfig } from '@/actions/settings';
import { getBanners } from '@/actions/design';
import { ProductCard } from '@/components/features/ProductCard';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';

export const revalidate = 60; 

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BannerGrid({ banners }: { banners: any[] }) {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      {/* 👇 CAMBIO CLAVE: Usamos 12 columnas para máxima flexibilidad */}
      <div className="grid grid-cols-12 gap-6">
        {banners.map((banner) => {
            
            // Lógica de columnas basada en el tamaño
            let colSpanClass = "col-span-12"; // Por defecto full width en móvil
            let heightClass = "h-64";

            if (banner.size === 'FULL') {
                colSpanClass = "col-span-12"; // 100%
                heightClass = "h-[300px] md:h-[400px]"; // Más alto
            } else if (banner.size === 'HALF') {
                colSpanClass = "col-span-12 md:col-span-6"; // 50%
                heightClass = "h-[280px]";
            } else if (banner.size === 'GRID') {
                colSpanClass = "col-span-12 md:col-span-4"; // 33% (1/3)
                heightClass = "h-64";
            }

            return (
              <Link 
                key={banner.id} 
                href={banner.link} 
                className={`group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all ${colSpanClass} ${heightClass}`}
              >
                <Image 
                    src={banner.image} 
                    alt={banner.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                    <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                        <div>
                             <h3 
                                className={`font-extrabold drop-shadow-md leading-tight ${banner.size === 'GRID' ? 'text-xl' : 'text-2xl md:text-3xl'}`}
                                style={{ color: banner.textColor || '#FFFFFF' }}
                            >
                                {banner.title}
                            </h3>
                        </div>
                        <span 
                            style={{ backgroundColor: banner.btnColor, color: banner.btnTextColor || '#FFFFFF' }} 
                            className="inline-block px-4 py-2 rounded-full text-sm font-bold shadow-lg transform transition-transform group-hover:-translate-y-1 text-center min-w-[100px]"
                        >
                            {banner.btnText}
                        </span>
                    </div>
                </div>
              </Link>
            );
        })}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [productsRes, config, banners] = await Promise.all([
    getProducts(),
    getStoreConfig(),
    getBanners(true) // Solo activos
  ]);

  const products = productsRes.data;
  const topBanners = banners.filter((b: any) => b.position === 'TOP');
  const bottomBanners = banners.filter((b: any) => b.position === 'BOTTOM');

  return (
    <main>
      {/* 1. HERO SECTION PERSONALIZABLE */}
      <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden flex items-center justify-center text-center bg-slate-900">
        {config.heroImage ? (
            <Image 
                src={config.heroImage} 
                alt="Hero" 
                fill 
                className="object-cover opacity-70"
                priority
            />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-90" />
        )}
        
        <div className="relative z-10 container px-4 animate-in fade-in zoom-in duration-700">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-7xl">
            {config.heroTitle || "Celebra a lo Grande"}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-white/90 md:text-2xl drop-shadow-md">
            {config.heroSubtitle}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="text-white hover:opacity-90 text-lg px-8 py-6 font-bold shadow-xl border-none rounded-full transition-transform hover:scale-105" style={{ backgroundColor: config.heroBtnColor || '#fb3099' }}>
              <Link href={config.heroButtonLink || "#catalogo"}>
                {config.heroButtonText || "Ver Catálogo"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. BANNERS SUPERIORES (TOP) */}
      <BannerGrid banners={topBanners} />

      {/* 3. CATÁLOGO */}
      <section id="catalogo" className="container mx-auto px-4 py-16">
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
            Nuestros Productos
          </h2>
          <div className="mt-2 h-1.5 w-24 rounded-full bg-primary"></div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <PartyPopper className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Aún no hay productos disponibles.</p>
          </div>
        )}
      </section>

      {/* 4. BANNERS INFERIORES (BOTTOM) */}
      <BannerGrid banners={bottomBanners} />

    </main>
  );
}