'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Ticket, Save } from 'lucide-react';
import { createCoupon } from '@/actions/coupon';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

// 1. Definimos el Schema
const formSchema = z.object({
  code: z.string().min(3, "Mínimo 3 caracteres").toUpperCase(),
  discount: z.coerce.number().min(1, "Mínimo 1"),
  type: z.enum(["FIXED", "PERCENTAGE"]),
});

// 2. Definimos el Tipo explícito
type FormValues = z.infer<typeof formSchema>;

export function CouponForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    // 👇 3. SOLUCIÓN: Silenciamos el conflicto de tipos del resolver
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      code: '',
      discount: 0,
      type: 'FIXED',
    },
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const res = await createCoupon(values);
    if (res.success) {
      toast.success('Cupón creado correctamente');
      router.push('/admin/coupons');
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" /> Nuevo Cupón
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código (Ej: FIESTA20)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="FIESTA20" 
                      {...field} 
                      onChange={e => field.onChange(e.target.value.toUpperCase())} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FIXED">Monto Fijo (S/.)</SelectItem>
                          <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descuento</FormLabel>
                      <FormControl>
                        {/* 👇 4. SOLUCIÓN: Manejo manual del input numérico */}
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
            </div>

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Crear Cupón
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}