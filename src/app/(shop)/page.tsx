import Link from 'next/link';
import { getProducts } from '@/actions/products';
import { ProductCard } from '@/components/features/ProductCard';
import { Button } from '@/components/ui/button';
import { PartyPopper, Cake, Sparkles, Gift } from 'lucide-react';

export const revalidate = 60; 

export default async function HomePage() {
  const { success, data: products } = await getProducts();

  if (!success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-red-600">¡Ups! Algo salió mal.</h2>
        <p className="text-slate-600">No pudimos cargar los productos de la fiesta.</p>
      </div>
    );
  }

  return (
    <main>
      {/* 1. HERO SECTION (NUEVO) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-secondary to-primary py-20 text-center md:py-32">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')] opacity-20 mix-blend-overlay"></div>
        <div className="container relative z-10 mx-auto px-4">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white drop-shadow-md md:text-7xl">
            Celebra a lo Grande
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-white/90 md:text-xl">
            Globos, decoración y todo lo que necesitas para que tu fiesta en Trujillo sea inolvidable.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-slate-100 text-lg px-8 font-bold shadow-lg">
              <Link href="#catalogo">Ver Productos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORÍAS RÁPIDAS (NUEVO) */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link href="/category/globos" className="group flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <PartyPopper className="h-6 w-6" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-primary">Globos</span>
            </Link>
            <Link href="/category/velas" className="group flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                <Cake className="h-6 w-6" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-secondary-foreground">Velas</span>
            </Link>
            <Link href="/category/decoracion" className="group flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-purple-600">Decoración</span>
            </Link>
            <Link href="/search?q=" className="group flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Gift className="h-6 w-6" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-slate-800">Ver Todo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. CATÁLOGO PRINCIPAL */}
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
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                <PartyPopper className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-xl font-medium text-slate-600">¡Estamos preparando el inventario!</p>
            <p className="text-slate-400">Vuelve pronto para ver nuestros productos.</p>
          </div>
        )}
      </section>
    </main>
  );
}