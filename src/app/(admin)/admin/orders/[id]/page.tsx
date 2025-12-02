import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getOrderById } from '@/actions/order';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrderActions } from './OrderActions';
import { MapPin, Store, Truck, MessageSquarePlus } from 'lucide-react';


interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result || !result.order) notFound();

  const { order } = result;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short' }).format(date);
  };

  // --- CÁLCULOS MATEMÁTICOS ---
  const shippingCost = Number(order.shippingCost);
  const totalPaid = Number(order.totalAmount);
  
  // Suma de productos puros
  const itemsSubtotal = order.orderItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  
  // Lo que debió costar (Productos + Envío)
  const theoreticalTotal = itemsSubtotal + shippingCost;
  
  // Descuento = Lo que debió costar - Lo que pagó realmente
  // (Si sale positivo, es que hubo descuento)
  const discountAmount = theoreticalTotal - totalPaid;
  const hasDiscount = discountAmount > 0.01;

  // Icono según método
  const DeliveryIcon = order.deliveryMethod === 'DELIVERY' ? Truck : (order.deliveryMethod === 'PROVINCE' ? MapPin : Store);
  const deliveryLabel = {
    'PICKUP': 'Recojo en Tienda',
    'DELIVERY': 'Delivery Local',
    'PROVINCE': 'Envío a Provincia'
  }[order.deliveryMethod] || order.deliveryMethod;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Pedido #{order.id.split('-')[0].toUpperCase()}
          </h1>
          <p className="text-slate-500 mt-1">Realizado el {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
           {order.status === 'PENDING' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 px-4 py-1">Pendiente</Badge>}
           {order.status === 'DELIVERED' && <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-4 py-1">Entregado</Badge>}
           {order.status === 'CANCELLED' && <Badge variant="destructive" className="px-4 py-1">Cancelado</Badge>}
           
           {order.isPaid ? 
             <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 px-4 py-1">Pagado</Badge> : 
             <Badge variant="outline" className="text-slate-500 px-4 py-1">No Pagado</Badge>
           }
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Productos</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded border bg-slate-100">
                          {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />}
                        </div>
                        <span className="font-medium text-slate-900">{item.product.title}</span>
                      </TableCell>
                      <TableCell className="text-right">{formatPrice(Number(item.price))}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-bold">{formatPrice(Number(item.price) * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* RESUMEN FINANCIERO */}
              <div className="flex justify-end mt-6">
                <div className="w-full md:w-1/2 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal Productos</span>
                    <span>{formatPrice(itemsSubtotal)}</span>
                  </div>
                  
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Costo de Envío</span>
                        <span>{formatPrice(shippingCost)}</span>
                    </div>
                  )}

                  {hasDiscount && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>Descuento Aplicado</span>
                        <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-slate-900">
                    <span>Total Pagado</span>
                    <span>{formatPrice(totalPaid)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: INFO Y ACCIONES */}
        <div className="space-y-6">
          <OrderActions orderId={order.id} initialStatus={order.status} initialIsPaid={order.isPaid} />

          {/* DATOS DE ENTREGA */}
          <Card>
            <CardHeader><CardTitle>Entrega</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                    <DeliveryIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                        <p className="font-medium text-slate-900">{deliveryLabel}</p>
                        {order.shippingAddress && (
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                {order.shippingAddress}
                            </p>
                        )}
                        {order.deliveryMethod === 'PROVINCE' && (
                            <p className="text-xs text-orange-600 mt-1 font-medium bg-orange-50 inline-block px-2 py-0.5 rounded">
                                Pago de envío en destino
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* DATOS CLIENTE */}
          <Card>
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Nombre</p>
                <p className="text-lg font-medium text-slate-900">{order.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">WhatsApp</p>
                <div className="flex items-center gap-2">
                    <p className="text-lg font-medium text-slate-900">{order.clientPhone}</p>
                    <a href={`https://wa.me/51${order.clientPhone}`} target="_blank" rel="noreferrer" className="text-green-600 text-sm hover:underline">(Chat)</a>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* TARJETA DE NOTAS */}
          {order.notes && (
            <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                    <CardTitle className="text-yellow-800 flex items-center gap-2">
                        <MessageSquarePlus className="h-5 w-5" /> Notas del Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-yellow-900 italic">
                        &ldquo;{order.notes}&rdquo;
                    </p>
                </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}