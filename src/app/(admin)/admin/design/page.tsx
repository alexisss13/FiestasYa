import { getStoreConfig } from '@/actions/settings';
import { getBanners } from '@/actions/design';
import { HeroForm } from '@/components/features/HeroForm';
import { BannersManager } from '@/components/features/BannersManager';
import { Separator } from '@/components/ui/separator';
import { Palette } from 'lucide-react';

export default async function DesignPage() {
  const [config, banners] = await Promise.all([
    getStoreConfig(), // Asegúrate de que getStoreConfig devuelva los campos del hero (modifica settings.ts si es necesario)
    getBanners()
  ]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-pink-100 rounded-lg text-pink-600">
            <Palette className="h-8 w-8" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Personalizar Tienda</h1>
            <p className="text-slate-500">Gestiona la portada y promociones visibles en el inicio.</p>
        </div>
      </div>

      {/* SECCIÓN HERO */}
      <section id="hero-config">
        <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Portada Principal (Hero)</h2>
            <p className="text-sm text-slate-500">Es lo primero que ven tus clientes. Usa una imagen de alta calidad (1920x600 aprox).</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <HeroForm initialData={config} />
        </div>
      </section>

      <Separator />

      {/* SECCIÓN BANNERS */}
      <section id="banners-config">
        <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Banners Promocionales</h2>
            <p className="text-sm text-slate-500">Tarjetas destacadas que aparecen debajo de la portada.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <BannersManager initialBanners={banners} />
        </div>
      </section>
    </div>
  );
}