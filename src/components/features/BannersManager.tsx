'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Link as LinkIcon, LayoutTemplate, ArrowUpDown, Palette, Pencil, Type, X, GripVertical, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import { createBanner, updateBanner, deleteBanner, reorderBanners } from '@/actions/design';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ui/image-upload';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

// DND Kit Imports (Actualizados para Grid)
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const bannerSchema = z.object({
  title: z.string().min(3, "Mínimo 3 letras"),
  image: z.string().min(1, "Imagen requerida"),
  link: z.string().min(1, "Link requerido"),
  btnText: z.string().min(1, "Texto botón requerido"),
  btnColor: z.string().min(4, "Color requerido"),
  btnTextColor: z.string().min(4, "Color texto botón requerido"),
  textColor: z.string().min(4, "Color texto requerido"),
  position: z.enum(["TOP", "BOTTOM"]),
  size: z.enum(["GRID", "FULL", "HALF"]),
  order: z.coerce.number().default(0),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

// --- COMPONENTE DE TARJETA SORTABLE (Versión Grid) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableBannerItem({ banner, onEdit, onDelete }: { banner: any, onEdit: (b: any) => void, onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Definir el ancho según el tipo (Sistema de 6 columnas)
    let colSpanClass = "col-span-6"; // Por defecto FULL
    if (banner.size === 'HALF') colSpanClass = "col-span-6 md:col-span-3"; // 50%
    if (banner.size === 'GRID') colSpanClass = "col-span-6 md:col-span-2"; // 33%

    return (
        <div ref={setNodeRef} style={style} className={`${colSpanClass} relative group`}>
            <Card className="overflow-hidden flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Imagen y Grip */}
                <div className="relative h-32 w-full bg-slate-100 group-drag">
                     <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                     
                     {/* Grip Button (Solo visible al hacer hover o siempre si prefieres) */}
                     <div {...attributes} {...listeners} className="absolute top-2 left-2 p-1.5 bg-white/80 rounded cursor-grab active:cursor-grabbing hover:bg-white shadow-sm z-10">
                        <GripVertical className="w-4 h-4 text-slate-600" />
                     </div>

                     {/* Badges Info */}
                     <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                        <Badge className="bg-black/70 text-[10px] backdrop-blur-sm border-none">{banner.size}</Badge>
                     </div>
                </div>

                {/* Contenido */}
                <CardContent className="p-3 flex flex-col justify-between flex-1 gap-3">
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1" style={{ color: '#000' }}>{banner.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span 
                                className="text-[10px] px-2 py-0.5 rounded font-bold border"
                                style={{ backgroundColor: banner.btnColor, color: banner.btnTextColor, borderColor: banner.btnColor }}
                            >
                                {banner.btnText}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">{banner.link}</span>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(banner)}>
                                <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50" onClick={() => onDelete(banner.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


// --- COMPONENTE PRINCIPAL ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BannersManager({ initialBanners }: { initialBanners: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [banners, setBanners] = useState(initialBanners);

  useEffect(() => { setBanners(initialBanners); }, [initialBanners]);

  const defaultValues: BannerFormValues = { 
    title: '', image: '', link: '', 
    btnText: 'Ver Más', btnColor: '#000000', btnTextColor: '#FFFFFF', textColor: '#FFFFFF',
    position: 'TOP', size: 'GRID', order: 0 
  };

  const form = useForm<BannerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bannerSchema) as any,
    defaultValues,
    mode: "onChange"
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Distancia mínima para evitar clicks accidentales
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 🛡️ FIX: Lógica de reordenamiento corregida (Server Action fuera del setState)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
        const oldIndex = banners.findIndex((item) => item.id === active.id);
        const newIndex = banners.findIndex((item) => item.id === over.id);
        
        // 1. Calculamos el nuevo estado optimista
        const newItems = arrayMove(banners, oldIndex, newIndex);
        setBanners(newItems); // Actualizamos UI inmediatamente

        // 2. Preparamos los datos para el servidor
        // Solo necesitamos enviar los IDs y sus nuevos índices como orden
        const updates = newItems.map((item, index) => ({ id: item.id, order: index }));
        
        // 3. Llamamos al servidor (en segundo plano)
        await reorderBanners(updates);
        router.refresh();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    form.reset({
      ...banner,
      btnTextColor: banner.btnTextColor || '#FFFFFF',
      order: banner.order // Mantenemos el orden
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset(defaultValues);
  };

  const onSubmit = async (values: BannerFormValues) => {
    setIsLoading(true);
    let res;
    if (editingId) res = await updateBanner(editingId, values);
    else res = await createBanner(values);

    if (res.success) {
        toast.success(editingId ? "Banner actualizado" : "Banner creado");
        handleCancel();
        router.refresh();
    } else {
        toast.error("Ocurrió un error");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar banner permanentemente?")) return;
    await deleteBanner(id);
    router.refresh();
    toast.success("Banner eliminado");
    if (editingId === id) handleCancel();
  };

  const topBanners = banners.filter(b => b.position === 'TOP');
  const bottomBanners = banners.filter(b => b.position === 'BOTTOM');

  return (
    <div className="space-y-12">
      
      {/* FORMULARIO */}
      <Card className={`border-2 transition-colors duration-500 ${editingId ? 'border-amber-400 bg-amber-50/50' : 'border-dashed bg-slate-50/30'}`}>
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    {editingId ? <Pencil className="h-5 w-5 text-amber-600" /> : <Plus className="h-5 w-5" />} 
                    {editingId ? 'Editando Banner' : 'Agregar Nuevo Banner'}
                </h3>
                {editingId && <Button variant="ghost" size="sm" onClick={handleCancel}><X className="h-4 w-4 mr-2" /> Cancelar</Button>}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <FormField control={form.control} name="image" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagen</FormLabel>
                                    <FormControl>
                                        <ImageUpload value={field.value ? [field.value] : []} onChange={(url) => field.onChange(url[0])} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            {/* PREVIEW */}
                            <div className="p-4 rounded-lg border bg-slate-100 min-h-[120px] flex items-center justify-center relative overflow-hidden group">
                                {form.watch('image') ? (
                                    <Image src={form.watch('image')} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="text-slate-400 text-xs">Previsualización</div>
                                )}
                                <div className="relative z-10 bg-black/40 p-3 rounded backdrop-blur-sm text-center max-w-[80%]">
                                    <p style={{ color: form.watch('textColor') }} className="font-bold text-lg leading-tight">{form.watch('title') || 'Título'}</p>
                                    <span style={{ backgroundColor: form.watch('btnColor'), color: form.watch('btnTextColor') }} className="text-[10px] px-3 py-1 rounded-full mt-2 inline-block font-semibold shadow-sm">
                                        {form.watch('btnText') || 'Botón'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField control={form.control} name="textColor" render={({ field }) => <FormItem><FormLabel>Color Título</FormLabel><div className="flex gap-2"><input type="color" className="w-9 h-9 rounded cursor-pointer" {...field} /><Input {...field} className="flex-1" /></div></FormItem>} />
                            </div>
                            <FormField control={form.control} name="link" render={({ field }) => <FormItem><FormLabel>Link Destino</FormLabel><FormControl><Input placeholder="/category/..." {...field} /></FormControl><FormMessage /></FormItem>} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="position" render={({ field }) => <FormItem><FormLabel>Ubicación</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="TOP">Arriba</SelectItem><SelectItem value="BOTTOM">Abajo</SelectItem></SelectContent></Select></FormItem>} />
                                <FormField control={form.control} name="size" render={({ field }) => <FormItem><FormLabel>Tamaño</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="GRID">Tarjeta (33%)</SelectItem><SelectItem value="HALF">Mitad (50%)</SelectItem><SelectItem value="FULL">Ancho (100%)</SelectItem></SelectContent></Select></FormItem>} />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="btnText" render={({ field }) => <FormItem className="col-span-1"><FormLabel>Texto Btn</FormLabel><Input {...field} /></FormItem>} />
                                <FormField control={form.control} name="btnColor" render={({ field }) => <FormItem className="col-span-1"><FormLabel>Fondo Btn</FormLabel><input type="color" className="w-full h-10 rounded cursor-pointer" {...field} /></FormItem>} />
                                <FormField control={form.control} name="btnTextColor" render={({ field }) => <FormItem className="col-span-1"><FormLabel>Color Txt</FormLabel><input type="color" className="w-full h-10 rounded cursor-pointer" {...field} /></FormItem>} />
                            </div>
                            
                            <div className="flex justify-end pt-2">
                                <Button type="submit" className={`w-full md:w-auto min-w-[200px] ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900'}`} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingId ? 'Guardar Cambios' : 'Crear Banner'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>

      {/* LISTAS SEPARADAS CON DND */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        
        <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2 mb-4">
                {/* 👇 CAMBIO AQUÍ: Icono en lugar de emoji */}
                <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
                    <ArrowUpToLine className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Banners Superiores</h3>
                <Badge variant="secondary" className="ml-auto">{topBanners.length}</Badge>
            </div>
            
            <SortableContext items={topBanners.map(b => b.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-6 gap-4">
                    {topBanners.map(banner => (
                        <SortableBannerItem key={banner.id} banner={banner} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            </SortableContext>
            {topBanners.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2">
                    <LayoutTemplate className="h-8 w-8 opacity-20" />
                    <p className="text-sm">No hay banners en la sección superior.</p>
                </div>
            )}
        </div>

        <div className="space-y-4 pt-8">
             <div className="flex items-center gap-2 border-b pb-2 mb-4">
                {/* 👇 CAMBIO AQUÍ: Icono en lugar de emoji */}
                <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
                    <ArrowDownToLine className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Banners Inferiores</h3>
                <Badge variant="secondary" className="ml-auto">{bottomBanners.length}</Badge>
            </div>
            
            <SortableContext items={bottomBanners.map(b => b.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-6 gap-4">
                    {bottomBanners.map(banner => (
                        <SortableBannerItem key={banner.id} banner={banner} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            </SortableContext>
            {bottomBanners.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2">
                    <LayoutTemplate className="h-8 w-8 opacity-20" />
                    <p className="text-sm">No hay banners en la sección inferior.</p>
                </div>
            )}
        </div>

      </DndContext>
    </div>
  );
}