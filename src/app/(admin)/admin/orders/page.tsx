import { getOrders } from '@/actions/order';
import { OrdersView } from './OrdersView';
import { ExportButton } from './ExportButton'; // 👈 Importamos nuestro nuevo componente

export default async function AdminOrdersPage() {
  // Obtenemos los pedidos frescos de la BD
  const { success, data: orders } = await getOrders();

  if (!success || !orders) {
    return <div className="p-8 text-red-500">Error al cargar pedidos. Intenta recargar.</div>;
  }

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Pedidos</h1>
            <p className="text-slate-500">Gestiona, filtra y exporta tus ventas.</p>
        </div>
        
        {/* Aquí va el botón de exportación */}
        <div className="flex-shrink-0">
            <ExportButton orders={orders} />
        </div>
      </div>

      {/* Renderizamos la vista de tabla/tabs */}
      <OrdersView orders={orders} />
    </div>
  );
}