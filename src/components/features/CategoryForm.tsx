'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory } from '@/actions/categories';
import { Category, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
  
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [image, setImage] = useState(category?.image || '');
  
  // Usamos la prop defaultDivision o la de la categoría existente
  const currentDivision = category?.division || defaultDivision;
  const isFestamas = currentDivision === 'JUGUETERIA';

  // Clases dinámicas
  const brandFocusClass = isFestamas ? "focus-visible:ring-festamas-primary" : "focus-visible:ring-fiestasya-accent";
  const brandTextClass = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('image', image);
    // 👇 Inyección silenciosa
    formData.append('division', currentDivision);

    const result = category 
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    if (result.success) {
      toast.success(category ? 'Categoría actualizada' : 'Categoría creada');
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

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1200px] space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                {category ? 'Editar Categoría' : 'Nueva Categoría'}
                <span className={cn("text-xs px-2 py-1 rounded-md bg-slate-100 uppercase font-extrabold tracking-wide", brandTextClass)}>
                    {isFestamas ? 'Festamas' : 'FiestasYa'}
                </span>
            </h2>
        </div>
        <div className="flex gap-3">
            <Button type="button" variant="outline" asChild disabled={loading}>
                <Link href="/admin/categories">Cancelar</Link>
            </Button>
            <Button 
                type="submit" 
                className={cn("text-white min-w-[140px]", isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90")}
                disabled={loading}
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA (Información) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
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

        {/* COLUMNA DERECHA (Imagen) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
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