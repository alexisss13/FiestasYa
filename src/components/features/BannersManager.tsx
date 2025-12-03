'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { createBanner, deleteBanner } from '@/actions/design';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageUpload from '@/components/ui/image-upload';
import { useRouter } from 'next/navigation';

const bannerSchema = z.object({
  title: z.string().min(3, "Mínimo 3 letras"),
  image: z.string().min(1, "Imagen requerida"),
  link: z.string().min(1, "Link requerido"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BannersManager({ initialBanners }: { initialBanners: any[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const form = useForm<z.infer<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { title: '', image: '', link: '' },
  });

  const onSubmit = async (values: z.infer<typeof bannerSchema>) => {
    setCreating(true);
    const res = await createBanner(values);
    if (res.success) {
        toast.success("Banner agregado");
        form.reset();
        router.refresh();
    } else {
        toast.error("Error al crear");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar banner?")) return;
    await deleteBanner(id);
    router.refresh();
    toast.success("Banner eliminado");
  };

  return (
    <div className="space-y-8">
      
      {/* LISTA DE BANNERS EXISTENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialBanners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden group relative">
                <div className="relative h-32 w-full">
                    <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                    </div>
                </div>
                <CardContent className="p-3 flex justify-between items-center text-sm text-slate-500">
                    <span className="truncate max-w-[150px]">{banner.link}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* FORMULARIO PARA AGREGAR NUEVO */}
      <Card className="border-dashed border-2 bg-slate-50/50">
        <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5" /> Agregar Nuevo Banner
            </h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <ImageUpload 
                                            value={field.value ? [field.value] : []} 
                                            onChange={(url) => field.onChange(url[0])}
                                            disabled={creating}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título del Banner</FormLabel>
                                        <FormControl><Input placeholder="Ej: Oferta Piñatas" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="link"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><LinkIcon className="h-3 w-3"/> Enlace al dar clic</FormLabel>
                                        <FormControl><Input placeholder="/category/pinatas" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-slate-900" disabled={creating}>
                                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Agregar a la web
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}