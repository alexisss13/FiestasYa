'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import { updateOrderStatus } from '@/actions/order';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Props {
  orderId: string;
  initialStatus: OrderStatus;
  initialIsPaid: boolean;
}

export function OrderActions({ orderId, initialStatus, initialIsPaid }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [isPaid, setIsPaid] = useState(initialIsPaid);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateOrderStatus(orderId, status, isPaid);
    
    if (result.success) {
      toast.success('Orden actualizada correctamente');
      router.refresh(); // Refresca la data de la página
    } else {
      toast.error('No se pudo actualizar la orden');
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* SELECTOR DE ESTADO */}
        <div className="space-y-2">
          <Label>Estado del Envío</Label>
          <Select 
            value={status} 
            onValueChange={(val) => setStatus(val as OrderStatus)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="DELIVERED">Entregado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SWITCH DE PAGO */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Pagado</Label>
            <p className="text-xs text-slate-500">
              Marcar si ya recibiste el dinero
            </p>
          </div>
          <Switch
            checked={isPaid}
            onCheckedChange={setIsPaid}
            disabled={loading}
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading} 
          className="w-full bg-slate-900 hover:bg-slate-800"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Actualizar Orden
        </Button>

      </CardContent>
    </Card>
  );
}