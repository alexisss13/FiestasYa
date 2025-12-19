'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory } from '@/actions/categories';
import { Category, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload'; 
import { cn } from '@/lib/utils';

interface Props {
  category?: Category | null;
  defaultDivision?: Division;
}

export function CategoryForm({ category, defaultDivision = 'JUGUETERIA' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // ESTADOS DEL FORMULARIO
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [image, setImage] = useState(category?.image || '');

  // ESTADO INICIAL (SNAPSHOT) PARA DETECTAR CAMBIOS
  const [initialData, setInitialData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    image: category?.image || ''
  });
  
  // LÓGICA IS DIRTY
  const isDirty = 
    name !== initialData.name || 
    slug !== initialData.slug || 
    image !== initialData.image;

  // 1. EFECTO: Advertencia de salida del navegador (Cerrar pestaña / F5)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 2. EFECTO: Intercepción de Navegación Interna (Links de Next.js)
  useEffect(() => {
    if (!isDirty) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.target !== '_blank') {
        // Usamos confirm nativo porque es síncrono y bloquea la navegación
        if (!window.confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, true);
    return () => document.removeEventListener('click', handleAnchorClick, true);
  }, [isDirty]);
  
  const currentDivision = category?.division || defaultDivision;
  const isFestamas = currentDivision === 'JUGUETERIA';

  const brandFocusClass = isFestamas ? "focus-visible:ring-festamas-primary" : "focus-visible:ring-fiestasya-accent";
  const brandTextClass = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('image', image);
    formData.append('division', currentDivision);

    const result = category 
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    if (result.success) {
      toast.success(category ? 'Categoría actualizada' : 'Categoría creada');
      
      // Actualizamos el snapshot para "limpiar" el formulario
      setInitialData({ name, slug, image });
      
      router.push('/admin/categories');
      router.refresh();
    } else {
      toast.error(result.error || 'Ocurrió un error');
    }
    setLoading(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!category) { 
        setSlug(val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    }
  };

  // Función para cancelar manualmente
  const handleCancel = () => {
    if (isDirty) {
        if (window.confirm('¿Descartar cambios y salir?')) {
            router.back();
        }
    } else {
        router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1200px] space-y-6 md:space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 md:pb-6 gap-4">
        <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                {category ? 'Editar Categoría' : 'Nueva Categoría'}
                <span className={cn("text-xs px-2 py-1 rounded-md bg-slate-100 uppercase font-extrabold tracking-wide", brandTextClass)}>
                    {isFestamas ? 'Festamas' : 'FiestasYa'}
                </span>
                {/* 🚨 AVISO VISUAL */}
                {isDirty && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse border border-amber-200 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"/> Cambios sin guardar
                    </span>
                )}
            </h2>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel} 
                disabled={loading} 
                className="flex-1 md:flex-none"
            >
                Cancelar
            </Button>
            <Button 
                type="submit" 
                className={cn("text-white flex-1 md:flex-none min-w-[140px]", isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90")}
                disabled={loading || !isDirty} // Deshabilitado si no hay cambios
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-8 bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h3 className="font-bold text-base text-slate-900 mb-6 border-b pb-2">Datos Generales</h3>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Categoría</Label>
                    <Input 
                        id="name" 
                        placeholder="Ej. Bloques de Construcción" 
                        value={name}
                        onChange={handleNameChange}
                        required
                        className={brandFocusClass}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL Amigable)</Label>
                    <Input 
                        id="slug" 
                        placeholder="bloques-construccion" 
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                        className="bg-slate-50 font-mono text-sm"
                    />
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-4 bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h3 className="font-bold text-base text-slate-900 mb-4">Imagen de Portada</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                <ImageUpload 
                    value={image ? [image] : []}
                    disabled={loading}
                    onChange={(urlArray) => setImage(urlArray[0] || '')}
                />
                <p className="text-xs text-slate-400 mt-3 text-center">
                    Idealmente imagen cuadrada o rectangular pequeña.
                </p>
            </div>
        </div>
      </div>
    </form>
  );
}