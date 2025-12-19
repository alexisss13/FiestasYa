'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBanner, updateBanner } from '@/actions/banners';
import { BannerPosition, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Monitor, Smartphone, Link as LinkIcon, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload'; 
import { cn } from '@/lib/utils';

interface BannerData {
    id?: string;
    title: string;
    imageUrl: string;
    mobileUrl?: string | null;
    link?: string | null;
    position: BannerPosition;
    division: Division;
}

interface Props {
  banner?: BannerData | null;
  defaultDivision?: Division;
}

export function BannerForm({ banner, defaultDivision = 'JUGUETERIA' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const currentDivision = banner?.division || defaultDivision;
  const isFestamas = currentDivision === 'JUGUETERIA';

  const brandFocusClass = isFestamas ? "focus-visible:ring-festamas-primary" : "focus-visible:ring-fiestasya-accent";
  const brandTextClass = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";
  const brandButtonClass = isFestamas 
    ? "bg-festamas-primary hover:bg-festamas-primary/90" 
    : "bg-fiestasya-accent hover:bg-fiestasya-accent/90";

  // --- ESTADOS ---
  const [title, setTitle] = useState(banner?.title || '');
  const [link, setLink] = useState(banner?.link || '');
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || '');
  const [mobileUrl, setMobileUrl] = useState(banner?.mobileUrl || '');
  const [position, setPosition] = useState<BannerPosition>(banner?.position || 'MAIN_HERO');

  // --- SNAPSHOT INICIAL ---
  const [initialData, setInitialData] = useState({
    title: banner?.title || '',
    link: banner?.link || '',
    imageUrl: banner?.imageUrl || '',
    mobileUrl: banner?.mobileUrl || '',
    position: banner?.position || 'MAIN_HERO',
  });
  
  const isDirty = 
    title !== initialData.title || 
    link !== initialData.link || 
    imageUrl !== initialData.imageUrl ||
    mobileUrl !== initialData.mobileUrl ||
    position !== initialData.position;

  // Protección contra cierre accidental
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.target !== '_blank') {
        if (!window.confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?')) {
          e.preventDefault(); e.stopPropagation();
        }
      }
    };
    document.addEventListener('click', handleAnchorClick, true);
    return () => document.removeEventListener('click', handleAnchorClick, true);
  }, [isDirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
        toast.error("La imagen de escritorio es obligatoria");
        return;
    }
    setLoading(true);

    const dataToSend = {
        title,
        imageUrl,
        mobileUrl: mobileUrl || undefined,
        link: link || undefined,
        position,
        division: currentDivision
    };

    let result;
    if (banner?.id) {
        result = await updateBanner(banner.id, dataToSend);
    } else {
        result = await createBanner(dataToSend);
    }

    if (result.success) {
      toast.success(banner ? 'Banner actualizado' : 'Banner creado');
      setInitialData({ title, link, imageUrl, mobileUrl, position });
      router.push('/admin/banners');
      router.refresh();
    } else {
      toast.error(result.error || 'Error al guardar');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (isDirty) {
        if (window.confirm('¿Descartar cambios y salir?')) router.back();
    } else {
        router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1200px] space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                {banner ? 'Editar Banner' : 'Nuevo Banner'}
                <span className={cn("text-xs px-2 py-1 rounded-md bg-slate-100 uppercase font-extrabold tracking-wide", brandTextClass)}>
                    {isFestamas ? 'Festamas' : 'FiestasYa'}
                </span>
                {isDirty && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"/> Sin guardar
                    </span>
                )}
            </h2>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="flex-1 md:flex-none">
                Cancelar
            </Button>
            <Button type="submit" className={cn("text-white flex-1 md:flex-none min-w-[140px]", brandButtonClass)} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* IMÁGENES */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-slate-500" /> Imagen Desktop
                </h3>
                {/* 🛠️ FIX AQUÍ: onChange maneja el borrado si llega array vacío */}
                <ImageUpload 
                    value={imageUrl ? [imageUrl] : []}
                    disabled={loading}
                    onChange={(url) => setImageUrl(url[0] || '')}
                />
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-500" /> Imagen Móvil (Opcional)
                </h3>
                {/* 🛠️ FIX AQUÍ TAMBIÉN */}
                <ImageUpload 
                    value={mobileUrl ? [mobileUrl] : []}
                    disabled={loading}
                    onChange={(url) => setMobileUrl(url[0] || '')}
                />
            </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div className="lg:col-span-5 space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-slate-500" /> Configuración
                </h3>
                
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título (Referencia)</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={brandFocusClass} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link">Enlace Destino</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} className={`pl-9 ${brandFocusClass}`} placeholder="/category/..." />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="position">Ubicación</Label>
                        <Select value={position} onValueChange={(val) => setPosition(val as BannerPosition)}>
                            <SelectTrigger className={brandFocusClass}><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MAIN_HERO">Hero Principal (Grande)</SelectItem>
                                <SelectItem value="TOP_STRIP">Cintillo Superior (Delgado)</SelectItem>
                                <SelectItem value="MIDDLE_SECTION">Sección Media (Bloque)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-3 bg-slate-50 border rounded-md text-sm text-slate-500 flex justify-between items-center">
                        <span>Tienda: <strong>{isFestamas ? 'Festamas' : 'FiestasYa'}</strong></span>
                        <div className={cn("w-2 h-2 rounded-full", isFestamas ? "bg-festamas-primary" : "bg-fiestasya-accent")} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </form>
  );
}