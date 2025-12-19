'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrUpdateProduct } from '@/actions/product-form';
import { Product, Category, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, Save, DollarSign, Tag, 
  Percent, Layers, Palette, BoxSelect, Info, ScanBarcode, Printer 
} from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload';
import { cn } from '@/lib/utils';
import Barcode from 'react-barcode';
import { BarcodeControl } from '@/components/admin/BarcodeControl';

interface Props {
  product?: Product | null;
  categories: Category[];
  defaultDivision?: Division;
}

export function ProductForm({ product, categories, defaultDivision = 'JUGUETERIA' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // ESTADOS DEL FORMULARIO
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [color, setColor] = useState(product?.color || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [title, setTitle] = useState(product?.title || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(String(product?.price || ''));
  const [discount, setDiscount] = useState(product?.discountPercentage || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [wholesalePrice, setWholesalePrice] = useState(String(product?.wholesalePrice || ''));
  const [wholesaleMin, setWholesaleMin] = useState(String(product?.wholesaleMinCount || ''));
  const [groupTag, setGroupTag] = useState(product?.groupTag || '');
  const [tags, setTags] = useState(product?.tags.join(', ') || '');

  // ESTADO INICIAL (SNAPSHOT) PARA DETECTAR CAMBIOS
  const [initialData, setInitialData] = useState({
    images: product?.images || [],
    isAvailable: product?.isAvailable ?? true,
    color: product?.color || '',
    barcode: product?.barcode || '',
    title: product?.title || '',
    slug: product?.slug || '',
    categoryId: product?.categoryId || '',
    description: product?.description || '',
    price: String(product?.price || ''),
    discount: product?.discountPercentage || 0,
    stock: product?.stock || 0,
    wholesalePrice: String(product?.wholesalePrice || ''),
    wholesaleMin: String(product?.wholesaleMinCount || ''),
    groupTag: product?.groupTag || '',
    tags: product?.tags.join(', ') || ''
  });

  // LÓGICA IS DIRTY (Comparación profunda simple)
  const isDirty = 
    JSON.stringify(images) !== JSON.stringify(initialData.images) ||
    isAvailable !== initialData.isAvailable ||
    color !== initialData.color ||
    barcode !== initialData.barcode ||
    title !== initialData.title ||
    slug !== initialData.slug ||
    categoryId !== initialData.categoryId ||
    description !== initialData.description ||
    price !== initialData.price ||
    discount !== initialData.discount ||
    stock !== initialData.stock ||
    wholesalePrice !== initialData.wholesalePrice ||
    wholesaleMin !== initialData.wholesaleMin ||
    groupTag !== initialData.groupTag ||
    tags !== initialData.tags;

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

    // Función para interceptar clicks en enlaces
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      // Si es un link y no tiene target blank (nueva pestaña)
      if (anchor && anchor.target !== '_blank') {
        if (!window.confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?')) {
          e.preventDefault(); // Cancelar navegación
          e.stopPropagation();
        }
      }
    };

    // Escuchamos en la fase de captura para ser los primeros
    document.addEventListener('click', handleAnchorClick, true);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick, true);
    };
  }, [isDirty]);

  const currentDivision = product?.division || defaultDivision;
  const isFestamas = currentDivision === 'JUGUETERIA';
  const brandFocusClass = isFestamas ? "focus-visible:ring-festamas-primary" : "focus-visible:ring-fiestasya-accent";
  const brandTextClass = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Agregamos manualmente los estados controlados
    images.forEach(img => formData.append('images', img));
    if (isAvailable) formData.set('isAvailable', 'on');
    formData.set('division', currentDivision);
    formData.set('color', color);
    if (barcode) formData.set('barcode', barcode);

    const result = await createOrUpdateProduct(formData, product?.id);

    if (result.success) {
      toast.success(product ? 'Producto actualizado' : 'Producto creado');
      
      // Actualizamos el snapshot para "limpiar" el formulario
      setInitialData({
        images, isAvailable, color, barcode, title, slug, categoryId, description,
        price, discount, stock, wholesalePrice, wholesaleMin, groupTag, tags
      });
      
      router.push('/admin/products');
      router.refresh();
    } else {
      toast.error(result.error || 'Error al guardar');
    }
    setLoading(false);
  };

  const generateRandomBarcode = () => {
      const code = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      setBarcode(code);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!product) {
        setSlug(val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    }
  };

  // Función para cancelar manualmente (ignora la protección)
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
    <form onSubmit={handleSubmit} className="w-full max-w-[1600px] space-y-6 md:space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 md:pb-6 gap-4">
        <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                {product ? 'Editar Producto' : 'Nuevo Producto'}
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
                onClick={handleCancel} // Usamos nuestra función personalizada
                disabled={loading} 
                className="flex-1 md:flex-none"
            >
                Cancelar
            </Button>
            <Button 
                type="submit" 
                className={cn("text-white flex-1 md:flex-none min-w-[140px]", isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90")} 
                disabled={loading || !isDirty} 
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar
            </Button>
        </div>
      </div>

      {/* ... (El resto del formulario se mantiene igual) ... */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="xl:col-span-8 space-y-6">
            
            {/* 1. INFORMACIÓN BÁSICA + CÓDIGO DE BARRAS */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <Info className="h-4 w-4 text-slate-400" /> Información Básica
                    </h3>
                    {product && barcode && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 hidden sm:inline">Etiqueta:</span>
                            <BarcodeControl 
                                barcode={barcode} 
                                title={title} 
                                price={Number(price)}
                                wholesalePrice={Number(wholesalePrice)}
                                wholesaleMinCount={Number(wholesaleMin)}
                                discountPercentage={discount}
                                variant="outline"
                                className="h-9 w-9 border-slate-200"
                            />
                        </div>
                    )}
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Nombre del Producto</Label>
                        <Input 
                            id="title" name="title" 
                            value={title} onChange={(e) => handleTitleChange(e.target.value)} 
                            required className={brandFocusClass} 
                        />
                    </div>

                    {/* SECCIÓN CÓDIGO DE BARRAS */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 w-full space-y-2">
                            <Label htmlFor="barcode" className="flex items-center gap-2">
                                <ScanBarcode className="h-4 w-4" /> Código de Barras (EAN/UPC)
                            </Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="barcode" name="barcode" 
                                    value={barcode} onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="Generar o escanear..." 
                                    className="font-mono tracking-widest bg-white"
                                />
                                <Button type="button" variant="outline" onClick={generateRandomBarcode} title="Generar Aleatorio">
                                    Generar
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400">Déjalo vacío para autogenerar al guardar.</p>
                        </div>
                        
                        {/* VISTA PREVIA */}
                        <div className="flex-shrink-0 bg-white p-2 rounded border border-slate-200 min-h-[80px] flex items-center justify-center overflow-hidden">
                            {barcode ? (
                                <div className="max-w-[200px]">
                                    <Barcode value={barcode} width={1.5} height={40} fontSize={14} format="CODE128" />
                                </div>
                            ) : (
                                <span className="text-xs text-slate-300 italic">Vista previa</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            <Input 
                                id="slug" name="slug" 
                                value={slug} onChange={(e) => setSlug(e.target.value)}
                                required className="font-mono text-sm bg-slate-50" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Categoría</Label>
                            <select 
                                id="categoryId" name="categoryId" 
                                value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                                className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", brandFocusClass)}
                                required
                            >
                                <option value="">Seleccionar Categoría...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea 
                            id="description" name="description" 
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            required rows={6} className={brandFocusClass} 
                        />
                    </div>
                </div>
            </div>

            {/* 2. PRECIOS E INVENTARIO */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-400" /> Estrategia de Precios
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio Regular (S/)</Label>
                        <Input 
                            type="number" id="price" name="price" 
                            value={price} onChange={(e) => setPrice(e.target.value)}
                            required step="0.01" min="0" className={brandFocusClass} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="discountPercentage" className={brandTextClass + " font-semibold"}>Descuento (%)</Label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                type="number" id="discountPercentage" name="discountPercentage" 
                                value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                                min="0" max="100" className={`pl-9 ${brandFocusClass}`} 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock Disponible</Label>
                        <div className="relative">
                            <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                type="number" id="stock" name="stock" 
                                value={stock} onChange={(e) => setStock(Number(e.target.value))}
                                required min="0" className={`pl-9 ${brandFocusClass}`} 
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 p-4 bg-slate-50/50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="wholesalePrice" className="text-slate-600">Precio Mayorista (S/)</Label>
                        <Input 
                            type="number" id="wholesalePrice" name="wholesalePrice" 
                            value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)}
                            step="0.01" min="0" className="bg-white" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wholesaleMinCount" className="text-slate-600">Cantidad Mínima Mayorista</Label>
                        <Input 
                            type="number" id="wholesaleMinCount" name="wholesaleMinCount" 
                            value={wholesaleMin} onChange={(e) => setWholesaleMin(e.target.value)}
                            min="1" className="bg-white" 
                        />
                    </div>
                </div>
            </div>

            {/* 3. VARIANTES */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                    <BoxSelect className="h-4 w-4 text-slate-400" /> Variantes y Agrupación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="color" className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-slate-500" /> Color (Variante)
                        </Label>
                        <div className="flex gap-3">
                            <div className="relative shrink-0 overflow-hidden w-11 h-11 rounded-lg border border-slate-200 shadow-sm">
                                <input 
                                    type="color" 
                                    className="absolute -top-2 -left-2 w-[200%] h-[200%] p-0 cursor-pointer border-0 outline-none" 
                                    value={color.startsWith('#') && color.length === 7 ? color : '#000000'} 
                                    onChange={(e) => setColor(e.target.value)} 
                                />
                            </div>
                            <div className="flex-1">
                                <Input 
                                    id="color" name="color" 
                                    value={color} onChange={(e) => setColor(e.target.value)} 
                                    placeholder="#RRGGBB" className={`${brandFocusClass} font-mono uppercase`} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="groupTag" className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-slate-500" /> Group Tag (Agrupador)
                        </Label>
                        <Input 
                            id="groupTag" name="groupTag" 
                            value={groupTag} onChange={(e) => setGroupTag(e.target.value)}
                            placeholder="Ej. CAMISETA-VERANO-2025" className="uppercase font-mono text-sm bg-slate-50" 
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="xl:col-span-4 space-y-6">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold">Estado del Producto</Label>
                        <p className="text-xs text-slate-500">¿Visible para los clientes?</p>
                    </div>
                    <Switch 
                        id="isAvailable" 
                        checked={isAvailable} onCheckedChange={setIsAvailable} 
                        className={isFestamas ? "data-[state=checked]:bg-festamas-primary" : "data-[state=checked]:bg-fiestasya-accent"} 
                    />
                </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4">Galería de Imágenes</h3>
                <ImageUpload value={images} onChange={(urls) => setImages(urls)} />
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4">Etiquetas de Búsqueda</h3>
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (Separados por coma)</Label>
                    <Input 
                        id="tags" name="tags" 
                        value={tags} onChange={(e) => setTags(e.target.value)}
                        placeholder="verano, niños, oferta" className={brandFocusClass} 
                    />
                </div>
            </div>
        </div>
      </div>
    </form>
  );
}