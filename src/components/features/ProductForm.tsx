'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { productSchema } from '@/lib/zod';
import { createOrUpdateProduct } from '@/actions/product-form';
import ImageUpload from '@/components/ui/image-upload';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Palette, Tags } from 'lucide-react';
type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: (ProductFormValues & { id: string }) | null;
  categories: { id: string; name: string }[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Editar Producto' : 'Crear Producto';
  const action = initialData ? 'Guardar cambios' : 'Crear';

  const defaultValues: ProductFormValues = initialData ? {
    title: initialData.title,
    slug: initialData.slug,
    description: initialData.description,
    price: parseFloat(String(initialData.price)),
    stock: parseInt(String(initialData.stock)),
    categoryId: initialData.categoryId,
    images: initialData.images,
    isAvailable: initialData.isAvailable,
    color: initialData.color || '',
    groupTag: initialData.groupTag || '',
  } : {
    title: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    images: [],
    isAvailable: true,
    color: '',
    groupTag: '',
  };

  const form = useForm<ProductFormValues>({
    // 👇 AQUÍ ESTÁ LA SOLUCIÓN: Silenciamos el linter para esta línea específica
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues,
    mode: "onChange",
  });

  // Quitamos el tipado explícito 'SubmitHandler' para dejar que TS infiera el tipo correcto del form
  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    const result = await createOrUpdateProduct(data, initialData?.id || null);
    
    if (result.success) {
      toast.success(initialData ? 'Producto actualizado' : 'Producto creado');
      router.push('/admin/products');
      router.refresh();
    } else {
      toast.error(result.message || 'Error inesperado');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            
            {/* COLUMNA IZQUIERDA (2/3) */}
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Producto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Producto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Globo Metálico Dorado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug (URL)</FormLabel>
                            <FormControl>
                              <Input placeholder="globo-metalico-dorado" {...field} />
                            </FormControl>
                            <FormDescription>URL única del producto.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio (S/.)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...field} 
                                onChange={e => {
                                  const val = e.target.value;
                                  field.onChange(val === '' ? 0 : parseFloat(val));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detalles del producto..." className="resize-none h-32" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              {/* 👇 NUEVA SECCIÓN: VARIANTES */}
              <Card className="border-blue-100 bg-blue-50/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Palette className="h-5 w-5" /> Variantes de Color (Opcional)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="groupTag" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><Tags className="h-4 w-4"/> Agrupar con (Tag)</FormLabel>
                            <FormControl><Input placeholder="Ej: globos-metalicos-numeros" {...field} /></FormControl>
                            <FormDescription>Usa el MISMO texto exacto en todos los colores del mismo producto.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="color" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color del Producto</FormLabel>
                            <div className="flex gap-2">
                                <div className="w-10 h-10 rounded border overflow-hidden relative shadow-sm">
                                    <input type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" {...field} />
                                </div>
                                <FormControl>
                                    <Input placeholder="#FF0000" {...field} className="flex-1 font-mono" />
                                </FormControl>
                            </div>
                            <FormDescription>Selecciona el color representativo.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Inventario</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Disponible</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={e => {
                                  const val = e.target.value;
                                  field.onChange(val === '' ? 0 : parseFloat(val));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     <FormField
                        control={form.control}
                        name="isAvailable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm mt-2">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Disponible</FormLabel>
                              <FormDescription>
                                Mostrar en la tienda
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                </CardContent>
              </Card>
            </div>

            {/* COLUMNA DERECHA (1/3) */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload 
                            value={field.value} 
                            disabled={loading} 
                            onChange={(urls) => field.onChange(urls)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Organización</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800" size="lg">
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                {action}
              </Button>
            </div>

          </div>
        </form>
      </Form>
    </div>
  );
}