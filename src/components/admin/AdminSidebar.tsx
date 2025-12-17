'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, LogOut, 
  Tags, Ticket, Images, Store, Menu, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'; // 👈 Importamos SheetTitle y SheetHeader
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth-actions';
import { AdminStoreSwitcher } from './AdminStoreSwitcher';
import { Division } from '@prisma/client';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: Tags },
  { href: '/admin/banners', label: 'Banners', icon: Images },
  { href: '/admin/sections', label: 'Secciones Home', icon: Store },
  { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

interface Props {
  currentDivision: Division;
}

export const AdminSidebar = ({ currentDivision }: Props) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isFestamas = currentDivision === 'JUGUETERIA';
  
  const activeBgClass = isFestamas ? "bg-festamas-primary/10" : "bg-fiestasya-accent/10";
  const activeTextClass = isFestamas ? "text-festamas-primary font-bold" : "text-fiestasya-accent font-bold";
  const borderClass = isFestamas ? "border-r-festamas-primary/20" : "border-r-fiestasya-accent/20";
  const iconColorClass = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";

  useEffect(() => {
    const mainContent = document.getElementById('admin-main-content');
    if (mainContent) {
      // En móvil el margen siempre debe ser 0, en desktop depende del collapse
      if (window.innerWidth >= 768) {
         mainContent.style.marginLeft = isCollapsed ? '80px' : '256px';
      } else {
         mainContent.style.marginLeft = '0px';
      }
    }
  }, [isCollapsed]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-600">
      
      <div className={cn(
          "flex flex-col border-b px-4 py-4 gap-4 transition-all duration-300", 
          isCollapsed ? "items-center" : "",
          "border-slate-100"
      )}>
        {!isCollapsed && (
            <span className="text-xl font-bold tracking-tighter flex items-center gap-2 text-slate-800 px-2">
            Festamas <span className={cn("text-xs px-1.5 py-0.5 rounded bg-slate-100 uppercase font-semibold text-slate-500")}>Admin</span>
            </span>
        )}
        <AdminStoreSwitcher currentDivision={currentDivision} isCollapsed={isCollapsed} />
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-6 scrollbar-hide overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link 
              key={item.href}
              href={item.href} 
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                isCollapsed ? "justify-center" : "",
                isActive 
                  ? cn(activeBgClass, activeTextClass) 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                  "h-5 w-5 transition-colors", 
                  isActive ? iconColorClass : "text-slate-400 group-hover:text-slate-600"
              )} />
              {!isCollapsed && <span>{item.label}</span>}
              {isActive && (
                  <div className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full",
                      isFestamas ? "bg-festamas-primary" : "bg-fiestasya-accent"
                  )} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <Button 
          variant="ghost" 
          className={cn(
              "w-full text-red-500 hover:bg-red-50 hover:text-red-600",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3"
          )}
          onClick={async () => await logout()}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* 📱 MOBILE HEADER & TRIGGER */}
      <div className={cn(
          "md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center px-4 justify-between shadow-sm transition-colors",
          borderClass
      )}>
         <div className="flex items-center gap-3">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <Menu className="h-6 w-6 text-slate-600" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    {/* 🔴 FIX ACCESIBILIDAD: Título Oculto pero presente */}
                    <SheetHeader className="sr-only">
                        <SheetTitle>Menú de Navegación</SheetTitle>
                    </SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
            <span className="font-bold text-lg text-slate-800">Festamas Admin</span>
         </div>
         <div className={cn("w-3 h-3 rounded-full border-2 border-white ring-1 ring-slate-100", isFestamas ? "bg-festamas-primary" : "bg-fiestasya-accent")} />
      </div>

      {/* 💻 DESKTOP SIDEBAR */}
      <aside 
        className={cn(
            "fixed inset-y-0 left-0 z-40 hidden md:flex flex-col border-r bg-white transition-all duration-300 shadow-sm",
            isCollapsed ? "w-20" : "w-64",
            borderClass
        )}
      >
        <SidebarContent />
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 bg-white border shadow-md rounded-full p-1 text-slate-400 hover:text-slate-900 transition-colors z-50"
        >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  );
}