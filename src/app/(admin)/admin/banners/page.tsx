import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminBanners } from '@/actions/banners';
import { getAdminDivision } from '@/actions/admin-settings';
import { BannerList } from '@/components/admin/BannerList';
import { cn } from '@/lib/utils';

export default async function AdminBannersPage() {
  const selectedDivision = await getAdminDivision();
  // Asumimos que getAdminBanners ya filtra o traemos todo y filtramos (mejor si filtra en DB, pero mantengo tu lógica)
  const { data: banners } = await getAdminBanners(); 
  
  const isFestamas = selectedDivision === 'JUGUETERIA';
  const filteredBanners = banners?.filter(b => b.division === selectedDivision) || [];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Banners & Promociones</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organización: <span className={cn(
              "font-bold px-2 py-0.5 rounded-md text-xs uppercase",
              isFestamas ? "bg-festamas-primary/10 text-festamas-primary" : "bg-fiestasya-accent/10 text-fiestasya-accent"
            )}>{selectedDivision}</span>
          </p>
        </div>
        
        <Button 
          asChild 
          className={cn(
            "w-full md:w-auto h-11 px-6 shadow-lg transition-all active:scale-[0.98] text-white font-bold",
            isFestamas 
              ? "bg-festamas-primary hover:bg-festamas-primary/90" 
              : "bg-fiestasya-accent hover:bg-fiestasya-accent/90"
          )}
        >
          <Link href="/admin/banners/new">
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Banner
          </Link>
        </Button>
      </div>

      <BannerList initialBanners={filteredBanners} division={selectedDivision} />
    </div>
  );
}