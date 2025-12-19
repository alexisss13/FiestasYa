'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Loader2, Plus, Trash2, Pencil, X, 
  GripVertical, Monitor, Smartphone, Link as LinkIcon,
  Image as ImageIcon, LayoutTemplate, MousePointerClick
} from 'lucide-react';
import { createBanner, updateBanner, deleteBanner, reorderBanners } from '@/actions/banners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ImageUpload from '@/components/ui/image-upload';
import { useRouter } from 'next/navigation';
import { BannerPosition, Division } from '@prisma/client';
import { cn } from '@/lib/utils';

// DND Kit Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- SCHEMA ZOD ---
const bannerSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  imageUrl: z.string().min(1, "La imagen de escritorio es requerida"),
  mobileUrl: z.string().optional(),
  link: z.string().optional(),
  position: z.nativeEnum(BannerPosition),
  division: z.nativeEnum(Division),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

// --- TARJETA SORTABLE (ITEM INDIVIDUAL) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableBannerItem({ banner, onEdit, onDelete, brandColor }: { banner: any, onEdit: (b: any) => void, onDelete: (id: string) => void, brandColor: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group col-span-1 h-full">
            <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col group-hover:border-slate-300">
                {/* ZONA DE IMAGEN Y DRAG */}
                <div className="relative aspect-video w-full bg-slate-100 group-drag border-b border-slate-100">
                     <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                     
                     {/* Overlay oscuro al hacer hover */}
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                     
                     {/* Botón de arrastre */}
                     <div {...attributes} {...listeners} className="absolute top-2 left-2 p-1.5 bg-white/90 rounded cursor-grab active:cursor-grabbing hover:bg-white shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-slate-600" />
                     </div>
                     
                     {/* Badge de Posición */}
                     <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end">
                        <Badge className={cn("text-[10px] backdrop-blur-sm border-none font-medium shadow-sm", brandColor)}>
                           {banner.position === 'MAIN_HERO' ? 'Hero Principal' : banner.position === 'TOP_STRIP' ? 'Cintillo' : 'Sección Media'}
                        </Badge>
                     </div>
                </div>

                {/* CONTENIDO TEXTO Y ACCIONES */}
                <CardContent className="p-4 flex flex-col gap-3 flex-1 justify-between">
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1 flex items-center gap-2" title={banner.title}>
                            {banner.title}
                        </h4>
                        {banner.link ? (
                             <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-xs bg-slate-50 p-1.5 rounded-md border border-slate-100">
                                <LinkIcon className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[180px]">{banner.link}</span>
                             </div>
                        ) : (
                            <div className="flex items-center gap-1.5 mt-2 text-slate-400 text-xs italic p-1.5">
                                <MousePointerClick className="w-3 h-3" /> Sin enlace
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                        {/* Indicadores con Tooltip Nativo (div wrapper) */}
                        <div className="flex items-center gap-3">
                             <div title={banner.mobileUrl ? "Versión Móvil Disponible" : "Sin versión móvil específica"} className="flex items-center gap-1">
                                {banner.mobileUrl ? (
                                    <Smartphone className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <Smartphone className="w-4 h-4 text-slate-300" />
                                )}
                             </div>

                             <div title="Versión Escritorio OK" className="flex items-center gap-1">
                                <Monitor className="w-4 h-4 text-blue-500" />
                             </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-500 hover:text-slate-700" onClick={() => onEdit(banner)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 text-slate-400 hover:text-red-500" onClick={() => onDelete(banner.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- MANAGER PRINCIPAL ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BannersManager({ initialBanners, currentDivision }: { initialBanners: any[], currentDivision: Division }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [banners, setBanners] = useState(initialBanners);
  
  // 🎨 LÓGICA DE COLORES DE MARCA
  const isFestamas = currentDivision === 'JUGUETERIA';
  
  // Clases dinámicas basadas en tu tailwind config
  const brandPrimaryBg = isFestamas ? "bg-festamas-primary" : "bg-fiestasya-accent"; // Usamos el accent de FiestasYa para botones por contraste
  const brandPrimaryText = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";
  const brandBorder = isFestamas ? "border-festamas-primary" : "border-fiestasya-accent";
  const brandLightBg = isFestamas ? "bg-festamas-primary/10" : "bg-fiestasya-accent/10"; // Color suave para fondos

  useEffect(() => { setBanners(initialBanners); }, [initialBanners]);

  const defaultValues: BannerFormValues = { 
    title: '', 
    imageUrl: '', 
    mobileUrl: '',
    link: '',
    position: 'MAIN_HERO',
    division: currentDivision,
  };

  const form = useForm<BannerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bannerSchema) as any,
    defaultValues,
    mode: "onChange"
  });

  // Sincronizar formulario si cambia la tienda
  useEffect(() => {
    if (!editingId) {
        form.reset({ ...defaultValues, division: currentDivision });
    }
  }, [currentDivision, form, editingId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
        const oldIndex = banners.findIndex((item) => item.id === active.id);
        const newIndex = banners.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(banners, oldIndex, newIndex);
        setBanners(newItems); // Optimistic UI

        const updates = newItems.map((item, index) => ({ id: item.id, order: index }));
        await reorderBanners(updates);
        router.refresh();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    form.reset({
      title: banner.title,
      imageUrl: banner.imageUrl,
      mobileUrl: banner.mobileUrl || '',
      link: banner.link || '',
      position: banner.position,
      division: banner.division,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset({ ...defaultValues, division: currentDivision });
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
        toast.error("Error al guardar banner");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar banner permanentemente?")) return;
    await deleteBanner(id);
    router.refresh();
    toast.success("Banner eliminado");
    if (editingId === id) handleCancel();
  };

  const currentBanners = banners.filter(b => b.division === currentDivision);
  currentBanners.sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER DECORATIVO */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            Gestión de Banners
            {/* Badge de Tienda Activa */}
            <span className={cn(
                "px-3 py-1 rounded-full text-sm font-semibold border",
                brandLightBg, brandPrimaryText, brandBorder
            )}>
                {isFestamas ? 'Festamas' : 'FiestasYa'}
            </span>
        </h2>
        <p className="text-slate-500">
            Crea y organiza los banners visibles en la tienda {isFestamas ? 'de juguetes' : 'de fiestas'}.
        </p>
      </div>

      {/* FORMULARIO DE EDICIÓN/CREACIÓN */}
      <Card className={cn(
          "border-l-4 shadow-sm transition-all duration-300", 
          editingId ? `border-amber-400 bg-amber-50/20` : `${brandBorder} bg-white`
      )}>
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {editingId ? (
                        <div className="p-2 bg-amber-100 rounded-md text-amber-700"><Pencil className="h-5 w-5" /></div>
                    ) : (
                        <div className={cn("p-2 rounded-md text-white shadow-sm", brandPrimaryBg)}>
                            <Plus className="h-5 w-5" />
                        </div>
                    )}
                    <span className="text-lg font-bold text-slate-800">
                        {editingId ? 'Editando Banner' : 'Agregar Nuevo Banner'}
                    </span>
                </div>
                {editingId && (
                    <Button variant="ghost" size="sm" onClick={handleCancel} className="text-slate-500 hover:text-slate-700">
                        <X className="h-4 w-4 mr-2" /> Cancelar
                    </Button>
                )}
            </CardTitle>
        </CardHeader>

        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* ZONA DE CARGA DE IMÁGENES */}
                        <div className="space-y-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Recursos Gráficos
                            </h4>
                            <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wide">Desktop (Principal)</FormLabel>
                                    <FormControl>
                                        <ImageUpload 
                                            value={field.value ? [field.value] : []} 
                                            onChange={(url) => field.onChange(url[0])} 
                                            disabled={isLoading} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="mobileUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wide">Móvil (Opcional)</FormLabel>
                                    <FormControl>
                                        <ImageUpload 
                                            value={field.value ? [field.value] : []} 
                                            onChange={(url) => field.onChange(url[0])} 
                                            disabled={isLoading} 
                                        />
                                    </FormControl>
                                    <p className="text-[11px] text-slate-400">Si se omite, se adaptará la imagen de escritorio.</p>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* ZONA DE DATOS */}
                        <div className="space-y-5">
                            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                <LayoutTemplate className="w-4 h-4" /> Configuración
                            </h4>
                            
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título de Referencia</FormLabel>
                                    <FormControl><Input placeholder="Ej: Campaña Navidad 2025" className="bg-white" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <FormField control={form.control} name="link" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enlace de Destino</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input placeholder="/category/..." className="pl-9 bg-white" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="position" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ubicación</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="MAIN_HERO">Hero Principal (Slider)</SelectItem>
                                                <SelectItem value="TOP_STRIP">Cintillo Superior</SelectItem>
                                                <SelectItem value="MIDDLE_SECTION">Sección Media</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                <FormField control={form.control} name="division" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>División Asignada</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled>
                                            <FormControl><SelectTrigger className="bg-slate-100/50"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="JUGUETERIA">Festamas</SelectItem>
                                                <SelectItem value="FIESTAS">FiestasYa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="pt-6 flex justify-end">
                                <Button 
                                    type="submit" 
                                    className={cn("w-full md:w-auto min-w-[180px] font-bold shadow-md transition-transform active:scale-95", brandPrimaryBg, "hover:opacity-90")} 
                                    disabled={isLoading}
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingId ? 'Guardar Cambios' : 'Publicar Banner'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>

      {/* LISTA DE BANNERS */}
      <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                Banners Activos
                <Badge variant="secondary" className="ml-2 font-normal text-slate-500 bg-slate-100">
                    {currentBanners.length}
                </Badge>
            </h3>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={currentBanners.map(b => b.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentBanners.map(banner => (
                        <SortableBannerItem 
                            key={banner.id} 
                            banner={banner} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete}
                            brandColor={cn(brandPrimaryBg, "text-white")} // Pasamos el color para el badge interno
                        />
                    ))}
                </div>
            </SortableContext>
          </DndContext>
            
          {currentBanners.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                    </div>
                    <h4 className="text-slate-900 font-semibold text-lg">No hay banners configurados</h4>
                    <p className="text-slate-500 max-w-sm mt-1 mb-6">
                        La tienda {isFestamas ? 'Festamas' : 'FiestasYa'} aún no tiene banners visibles. Usa el formulario de arriba para crear el primero.
                    </p>
                </div>
          )}
      </div>
    </div>
  );
}