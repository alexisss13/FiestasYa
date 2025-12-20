'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveHomeSection } from '@/actions/home-sections';
import { Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Sparkles, Gift, PartyPopper, Star, Tag, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ICONS_MAP = [
    { value: 'star', label: 'Estrella', icon: Star },
    { value: 'gift', label: 'Regalo', icon: Gift },
    { value: 'party', label: 'Fiesta', icon: PartyPopper },
    { value: 'sparkles', label: 'Destellos', icon: Sparkles },
    { value: 'tag', label: 'Etiqueta', icon: Tag },
];

interface SectionData {
    id?: string;
    title: string;
    subtitle: string | null;
    tag: string;
    division: Division;
    icon: string;
    isActive: boolean;
    // order ya no es necesario aquí
}

interface Props {
  section?: SectionData | null;
  defaultDivision?: Division;
}

export function SectionForm({ section, defaultDivision = 'JUGUETERIA' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const currentDivision = section?.division || defaultDivision;
  const isFestamas = currentDivision === 'JUGUETERIA';

  // Estilos Marca
  const brandFocusClass = isFestamas ? "focus-visible:ring-festamas-primary" : "focus-visible:ring-fiestasya-accent";
  const brandTextClass = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";
  const brandButtonClass = isFestamas 
    ? "bg-festamas-primary hover:bg-festamas-primary/90" 
    : "bg-fiestasya-accent hover:bg-fiestasya-accent/90";

  // --- ESTADOS ---
  const [title, setTitle] = useState(section?.title || '');
  const [subtitle, setSubtitle] = useState(section?.subtitle || '');
  const [tag, setTag] = useState(section?.tag || '');
  const [icon, setIcon] = useState(section?.icon || 'star');
  const [isActive, setIsActive] = useState(section?.isActive ?? true);

  // --- SNAPSHOT ---
  const [initialData, setInitialData] = useState({
    title: section?.title || '',
    subtitle: section?.subtitle || '',
    tag: section?.tag || '',
    icon: section?.icon || 'star',
    isActive: section?.isActive ?? true,
  });
  
  const isDirty = 
    title !== initialData.title || 
    subtitle !== initialData.subtitle || 
    tag !== initialData.tag ||
    icon !== initialData.icon ||
    isActive !== initialData.isActive;

  // Lógica de seguridad al salir
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
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
    if (!tag) { toast.error("El tag de filtro es obligatorio"); return; }
    setLoading(true);

    const dataToSend = {
        title,
        subtitle: subtitle || undefined,
        tag,
        icon,
        division: currentDivision,
        isActive,
        order: 0 // El server action ignora esto si es update, o lo calcula si es create
    };

    const result = await saveHomeSection(dataToSend, section?.id);

    if (result.ok) {
      toast.success(section ? 'Sección actualizada' : 'Sección creada');
      setInitialData({ title, subtitle, tag, icon, isActive });
      router.push('/admin/sections');
      router.refresh();
    } else {
      toast.error(result.message);
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
    <form onSubmit={handleSubmit} className="w-full max-w-[1000px] space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                {section ? 'Editar Sección' : 'Nueva Sección'}
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
        
        {/* COLUMNA IZQUIERDA: CONTENIDO */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2">
                    <LayoutTemplate className="w-4 h-4 text-slate-500" /> Contenido Visual
                </h3>
                
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título Principal</Label>
                        <Input 
                            id="title" 
                            placeholder="Ej. Regalos para Niños" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`text-lg font-semibold ${brandFocusClass}`}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtítulo (Opcional)</Label>
                        <Input 
                            id="subtitle" 
                            placeholder="Ej. Encuentra la sorpresa perfecta..." 
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className={brandFocusClass}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon">Icono Decorativo</Label>
                        <Select value={icon} onValueChange={setIcon}>
                            <SelectTrigger className={brandFocusClass}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ICONS_MAP.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        <div className="flex items-center gap-2">
                                            <item.icon className="w-4 h-4 text-slate-500" />
                                            <span>{item.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: CONFIGURACIÓN */}
        <div className="lg:col-span-5 space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2">
                    <Tag className="w-4 h-4 text-slate-500" /> Configuración Lógica
                </h3>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="tag">Tag de Filtro (Database)</Label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                id="tag"
                                placeholder="Ej. verano" 
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                className={`pl-9 font-mono text-sm bg-slate-50 ${brandFocusClass}`}
                            />
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Coincidencia exacta con productos.
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                        <div className="flex flex-col">
                            <Label htmlFor="active" className="cursor-pointer font-semibold text-slate-700">Visibilidad</Label>
                            <span className="text-xs text-slate-500">Mostrar en la página principal</span>
                        </div>
                        <Switch 
                            id="active" 
                            checked={isActive} 
                            onCheckedChange={setIsActive} 
                            className={isFestamas ? "data-[state=checked]:bg-festamas-primary" : "data-[state=checked]:bg-fiestasya-accent"}
                        />
                    </div>

                    <div className="p-3 bg-slate-50 border rounded-md text-xs text-slate-500 flex justify-between items-center">
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