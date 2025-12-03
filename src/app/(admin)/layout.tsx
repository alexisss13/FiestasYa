'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Tags, Ticket, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth-actions';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: Tags },
  { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
  { href: '/admin/design', label: 'Diseño Web', icon: Palette },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR FIJO IZQUIERDA */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-slate-900 text-white md:flex">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <span className="text-xl font-bold tracking-tighter">
            FiestasYa <span className="text-slate-400 font-normal text-sm">Admin</span>
          </span>
        </div>
        
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            // Verificamos si la ruta actual coincide con el link
            const isActive = pathname.startsWith(item.href);

            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-slate-800 text-white" // Estilo Activo
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100" // Estilo Inactivo
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-400 hover:bg-slate-800 hover:text-red-300"
            onClick={async () => await logout()}
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  );
}