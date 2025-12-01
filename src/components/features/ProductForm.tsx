'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form'; // 👈 Importamos SubmitHandler
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { productSchema } from '@/lib/zod';
import { createOrUpdateProduct } from '@/actions/product-form';
import ImageUpload from '@/components/ui/image-upload';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';

// 1. Definimos el tipo basado en el Schema
type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  // Aseguramos que initialData cumpla con el tipo, permitiendo que id sea extra
  initialData?: (ProductFormValues & { id: string }) | null;
  categories: { id: string; name: string }[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Editar Producto' : 'Crear Producto';
  const action = initialData ? 'Guardar cambios' : 'Crear';

  // 2. Preparamos los valores por defecto asegurando los tipos (números vs strings)
  const defaultValues: ProductFormValues = initialData ? {
    ...initialData,
    price: parseFloat(String(initialData.price)), // Aseguramos que sea número
    stock: parseInt(String(initialData.stock)),   // Aseguramos que sea entero
  } : {
    title: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    images: [],
    isAvailable: true,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues, // Usamos la variable preparada arriba
    mode: "onChange", // Valida mientras escribes para mejor UX
  });

  // 3. Tipamos explícitamente el manejador del submit
  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setLoading(true);
    const result = await createOrUpdateProduct(data, initialData?.id || null);
    
    if (result.success) {
      toast.success(initialData ? 'Producto actualizado correctamente' : 'Producto creado exitosamente');
      router.push('/admin/products');
      router.refresh();
    } else {
      toast.error(result.message || 'Ocurrió un error inesperado');
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
                            <FormDescription>Identificador único para la URL.</FormDescription>
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
                                // 👇 CORRECCIÓN AQUÍ:
                                onChange={e => {
                                  const val = e.target.value;
                                  // Si está vacío, guardamos 0. Si no, lo convertimos.
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
                                // 👇 CORRECCIÓN AQUÍ:
                                onChange={e => {
                                  const val = e.target.value;
                                  field.onChange(val === '' ? 0 : parseFloat(val)); // parseInt si quieres solo enteros
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