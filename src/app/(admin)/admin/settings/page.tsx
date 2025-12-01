'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save, MessageSquare, Phone } from 'lucide-react';
import { getStoreConfig, updateStoreConfig } from '@/actions/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  whatsappPhone: z.string().min(9, "Ingresa un celular válido (ej: 519...)"),
  welcomeMessage: z.string().min(1, "El mensaje no puede estar vacío"),
});

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whatsappPhone: '',
      welcomeMessage: '',
    },
  });

  // Cargar datos al iniciar
  useEffect(() => {
    getStoreConfig().then((config) => {
      form.reset({
        whatsappPhone: config.whatsappPhone,
        welcomeMessage: config.welcomeMessage,
      });
      setLoading(false);
    });
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSaving(true);
    const res = await updateStoreConfig(values);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center text-slate-500">Cargando configuración...</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500">Personaliza los datos de contacto de tu tienda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Canales de Venta</CardTitle>
          <CardDescription>
            Estos datos se usarán en el botón de WhatsApp y en el Checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="whatsappPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> WhatsApp del Negocio
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="51999999999" {...field} />
                    </FormControl>
                    <FormDescription>
                      Formato internacional sin símbolos (ej: 51987654321).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="welcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Mensaje Prederterminado (Checkout)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Hola FiestasYa, quiero confirmar mi pedido..." 
                        className="resize-none h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Este texto aparecerá cuando el cliente haga clic en "Completar pedido".
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800">
                  {saving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                    </>
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}