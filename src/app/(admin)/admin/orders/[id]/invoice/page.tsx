import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz'; 
import { es } from 'date-fns/locale';      
import PrintButton from './PrintButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: { product: true }
      }
    }
  });

  if (!order) notFound();

  const isFestamas = order.notes?.includes('Festamas') || false;
  
  const logoSrc = isFestamas 
    ? "/images/IconoFestamas.png" 
    : "/images/IconoFiestasYa.png";

  const companyName = "FiestasYa SAC";
  const ruc = "20610153756";
  const address = "Trujillo, Perú";
  const email = "festamastrujillo@gmail.com";

  const subtotal = Number(order.totalAmount) / 1.18;
  const igv = Number(order.totalAmount) - subtotal;

  const timeZone = 'America/Lima';
  const zonedDate = toZonedTime(order.createdAt, timeZone);

  // Lógica para mostrar teléfono solo si es real
  const showPhone = order.clientPhone && order.clientPhone !== '-' && order.clientPhone !== '999999999';

  return (
    <>
      {/* Estilos específicos para esta boleta */}
      <style>{`
        @media print {
            /* Contenido con margen interno seguro para impresoras */
            .invoice-container {
                padding: 1.5cm !important; 
            }
        }
      `}</style>

      {/* Clases explicadas:
         - bg-slate-100: Fondo gris en pantalla para distinguir la hoja.
         - print:bg-white: Fondo blanco al imprimir.
         - min-h-screen NO: Lo quitamos para evitar la hoja fantasma.
      */}
      <div className="bg-slate-100 flex items-start justify-center py-10 print:py-0 print:bg-white print:block">
        
        <div className="invoice-container bg-white w-full max-w-[21cm] p-8 md:p-12 shadow-2xl rounded-sm print:shadow-none print:w-full print:max-w-none print:p-0">
          
          {/* HEADER */}
          <div className="flex justify-between items-start mb-8 border-b pb-8 border-slate-100">
            <div className="flex flex-col gap-1">
               <div className="relative w-32 h-12 mb-2">
                  <Image src={logoSrc} alt="Logo" fill className="object-contain object-left" />
               </div>
               <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide">{companyName}</h1>
               <p className="text-sm text-slate-500">RUC: {ruc}</p>
               <p className="text-sm text-slate-500">{address}</p>
               <p className="text-sm text-slate-500">{email}</p>
            </div>
            
            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-800 uppercase">Boleta de Venta</h2>
              <p className="text-sm text-slate-500 mb-4">Electrónica</p>
              
              <div className="bg-slate-50 p-3 rounded border border-slate-100 inline-block text-left min-w-[200px]">
                  <p className="text-xs text-slate-400 font-bold uppercase">N° Comprobante</p>
                  <p className="font-mono text-lg font-bold text-slate-700">
                    {order.receiptNumber || 'PENDIENTE'}
                  </p>
                  
                  <p className="text-xs text-slate-400 font-bold uppercase mt-2">Fecha de Emisión</p>
                  <p className="text-sm text-slate-700 capitalize">
                      {format(zonedDate, "dd 'de' MMMM, yyyy", { locale: es })}
                  </p>
              </div>
            </div>
          </div>

          {/* DATOS DEL CLIENTE */}
          <div className="mb-8 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Cliente</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <p className="text-xs text-slate-400">Nombre / Razón Social:</p>
                      <p className="font-bold text-slate-800">{order.clientName}</p>
                  </div>
                  <div>
                      <p className="text-xs text-slate-400">DNI / RUC:</p>
                      <p className="font-bold text-slate-800 font-mono">
                        {order.notes?.match(/DNI: (\d+)/)?.[1] || (showPhone ? order.clientPhone : '-')}
                      </p>
                  </div>
                  {showPhone && (
                      <div className="col-span-2">
                          <p className="text-xs text-slate-400">Teléfono:</p>
                          <p className="text-slate-800 font-mono">{order.clientPhone}</p>
                      </div>
                  )}
                  {order.shippingAddress && (
                       <div className="col-span-2">
                          <p className="text-xs text-slate-400">Dirección:</p>
                          <p className="text-slate-800 uppercase">{order.shippingAddress}</p>
                      </div>
                  )}
              </div>
          </div>

          {/* TABLA ITEMS */}
          <table className="w-full mb-8">
              <thead className="border-b-2 border-slate-200">
                  <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3">Cant.</th>
                      <th className="py-3">Descripción</th>
                      <th className="py-3 text-right">P. Unit</th>
                      <th className="py-3 text-right">Total</th>
                  </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                  {order.orderItems.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                          <td className="py-3 font-mono pl-2">{item.quantity}</td>
                          <td className="py-3">
                              <span className="font-semibold block">{item.product.title}</span>
                          </td>
                          <td className="py-3 text-right font-mono">{formatCurrency(Number(item.price))}</td>
                          <td className="py-3 text-right font-bold font-mono">{formatCurrency(Number(item.price) * item.quantity)}</td>
                      </tr>
                  ))}
              </tbody>
          </table>

          {/* TOTALES */}
          <div className="flex justify-end mb-12">
              <div className="w-64 space-y-2">
                  <div className="flex justify-between text-slate-500 text-sm">
                      <span>Op. Gravada</span>
                      <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-sm">
                      <span>IGV (18%)</span>
                      <span>{formatCurrency(igv)}</span>
                  </div>
                  <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-end">
                      <span className="font-bold text-slate-900 text-lg">Total a Pagar</span>
                      <span className="font-black text-slate-900 text-xl">{formatCurrency(Number(order.totalAmount))}</span>
                  </div>
              </div>
          </div>

          {/* FOOTER */}
          <div className="text-center text-xs text-slate-400 mt-auto pt-8 border-t border-slate-100 print:pb-0 pb-10">
              <p className="font-medium text-slate-500 mb-1">Gracias por su compra en {isFestamas ? 'FESTAMAS' : 'FIESTASYA'}!</p>
              <p>Representación impresa de la Boleta de Venta Electrónica.</p>
              <p className="mt-2 font-mono text-[10px] text-slate-300">ID: {order.id}</p>
          </div>

          {/* BOTONES FLOTANTES */}
          <div className="fixed bottom-8 right-8 print:hidden flex gap-2 z-50">
              <PrintButton />
          </div>

        </div>
      </div>
    </>
  );
}