import { getAdminDivision } from '@/actions/admin-settings';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const division = await getAdminDivision();

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar controla su propio estado y ancho */}
      <AdminSidebar currentDivision={division} />

      {/* Main Content con margen dinámico controlado por el Sidebar via JS */}
      <main 
        id="admin-main-content"
        className="flex-1 transition-all duration-300 ease-in-out p-8 pt-20 md:pt-8"
        style={{ marginLeft: '256px' }} // Valor inicial (64 * 4px) para evitar FOUC
      >
        {children}
        {/* Fix responsive: en móvil quitamos el margen izquierdo por CSS global o media query si es necesario, 
            pero el style inline suele sobreescribirse fácil. 
            Agregamos un estilo css en línea para móvil específico aquí: */}
        <style>{`
          @media (max-width: 768px) {
            #admin-main-content { margin-left: 0 !important; }
          }
        `}</style>
      </main>
    </div>
  );
}