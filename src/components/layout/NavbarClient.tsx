'use client';

import { useEffect, useState, useRef, useTransition, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, Menu, MapPin, Heart, User, Home, Loader2, LogOut, Settings, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useUIStore, Division } from '@/store/ui';
import { useFavoritesStore } from '@/store/favorites'; // 👈 IMPORTAR STORE
import { CartSidebar } from '@/components/features/CartSidebar';
import { setCookie } from 'cookies-next';
import { logout } from '@/actions/auth-actions';

interface Category {
  id: string; 
  name: string; 
  slug: string;
  division: Division;
}

interface UserSession {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface NavbarClientProps {
  categories: Category[];
  defaultDivision: Division;
  user?: UserSession | null;
  // favoritesCount ya no es necesario como prop porque lo leemos del store
}

// --- BUSCADOR ---
function SearchInput({ onSearch, className, btnBgColor, iconColor, isTransparent }: { onSearch?: () => void, className?: string, btnBgColor?: string, iconColor?: string, isTransparent?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const value = searchParams.get('q') || '';
    if (value !== query) setQuery(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative w-full group", className)}>
      <Input
        type="text"
        placeholder="Buscar productos..."
        className={cn(
            "h-11 w-full pl-6 pr-14 border-0 rounded-full transition-all duration-300 text-[15px] font-normal shadow-sm group-hover:shadow-md focus-visible:ring-2",
            isTransparent 
                ? "bg-slate-100 focus-visible:ring-slate-200 text-slate-600 placeholder:text-slate-400" 
                : "!bg-white focus-visible:ring-white/50 text-slate-900 placeholder:text-slate-400"
        )}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button 
        type="submit" 
        className="absolute right-1 top-1 h-9 w-9 flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 shadow-sm"
        style={{ backgroundColor: btnBgColor, color: iconColor }} 
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Buscar</span>
      </button>
    </form>
  );
}

export function NavbarClient({ categories, defaultDivision, user }: NavbarClientProps) {
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const { setDivision } = useUIStore();
  
  // 🧠 CONECTAR AL STORE DE FAVORITOS (Para contador en tiempo real)
  const favorites = useFavoritesStore(state => state.favorites);
  const favoritesCount = favorites.length;
  
  // 1. ESTADO OPTIMISTA
  const [optimisticDivision, setOptimisticDivision] = useState<Division>(defaultDivision);
  
  // ⏳ HOOK DE TRANSICIÓN
  const [isPending, startTransition] = useTransition();

  // 2. SINCRONIZACIÓN
  useEffect(() => {
     setOptimisticDivision(defaultDivision);
     setDivision(defaultDivision);
  }, [defaultDivision, setDivision]);
  
  const [loaded, setLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!loaded) setLoaded(true);
  }, [loaded]);

  useEffect(() => {
    if (isMenuOpen) setIsMenuOpen(false);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, userMenuRef]);

  // 🔄 CAMBIO INSTANTÁNEO
  const handleDivisionChange = (newDivision: Division) => {
    if (optimisticDivision === newDivision) return;
    
    setOptimisticDivision(newDivision); 
    setDivision(newDivision);

    setCookie('festamas_division', newDivision, { maxAge: 60 * 60 * 24 * 30, path: '/' }); 

    startTransition(() => {
        router.refresh(); 
    });
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  const currentDivision = optimisticDivision; 
  const isToys = currentDivision === 'JUGUETERIA';
  const filteredCategories = categories.filter(cat => cat.division === currentDivision);
  const brandName = isToys ? 'Festamas' : 'FiestasYa';
  
  // --- COLORES & ESTILOS DINÁMICOS ---
  const festamasPink = '#fc4b65';
  
  const navbarStyleClass = isToys 
    ? "bg-[#fc4b65]" 
    : "bg-white/95 backdrop-blur-md border-b border-slate-200";

  const navTextClass = isToys ? "text-white" : "text-slate-600";
  
  const buttonHoverClass = isToys 
    ? "border-white/40 hover:bg-white hover:text-[#fc4b65] hover:border-white text-white" 
    : "border-transparent text-slate-600 hover:bg-pink-50 hover:text-[#ec4899] hover:border-pink-100";

  const activeMenuClass = isToys 
    ? "bg-white text-[#fc4b65] border-white shadow-md hover:bg-white hover:text-[#fc4b65]" 
    : "bg-pink-50 text-[#ec4899] border-pink-100 shadow-md hover:bg-pink-50 hover:text-[#ec4899]";

  const badgeClass = isToys 
    ? "bg-white text-[#fc4b65]" 
    : "bg-[#ec4899] text-white";

  const searchBtnColor = isToys ? '#be123c' : 'transparent';
  const searchIconColor = isToys ? '#ffffff' : '#64748b'; 

  const dropdownBrandColor = isToys ? "text-[#fc4b65]" : "text-[#ec4899]";
  const dropdownHoverColor = isToys ? "hover:text-[#fc4b65]" : "hover:text-[#ec4899]";
  
  const textPrimaryClass = isToys ? "text-[#fc4b65]" : "text-[#ec4899]";
  const hoverPrimaryTextClass = isToys ? "hover:text-[#fc4b65]" : "hover:text-[#ec4899]";
  const groupHoverPrimaryTextClass = isToys ? "group-hover:text-[#fc4b65]" : "group-hover:text-[#ec4899]";
  const bgPrimaryLightClass = isToys ? "bg-[#fc4b65]/10" : "bg-[#ec4899]/10";

  const iconFestamas = '/images/IconoFestamas.png';
  const iconFiestasYa = '/images/IconoFiestasYa.png';
  const activeIconPath = isToys ? iconFestamas : iconFiestasYa;

  return (
    <>
      {/* 🛡️ OVERLAY DE CARGA */}
      {isPending && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-in fade-in duration-200">
            <Loader2 
                className={cn(
                    "h-16 w-16 animate-spin mb-4", 
                    isToys ? "text-[#fc4b65]" : "text-[#ec4899]"
                )} 
            />
            <div className="flex flex-col items-center gap-2 animate-pulse">
                <p className="text-lg font-bold text-slate-700">
                    Cambiando a {isToys ? 'Festamas' : 'FiestasYa'}...
                </p>
                <p className="text-xs text-slate-400">Preparando los mejores productos para ti</p>
            </div>
        </div>
      )}

      {/* 1. SUPER HEADER */}
      <div className="w-full h-9 bg-white border-b border-slate-100 flex items-center z-[60] relative text-[11px]">
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center justify-between h-full">
            <div className="flex h-full mr-auto">
                 <button 
                    disabled={isPending} 
                    onClick={() => handleDivisionChange('JUGUETERIA')} 
                    className={cn(
                        "relative h-full px-4 flex items-center justify-center gap-2 transition-all duration-300 border-b-[3px]",
                        isToys ? "bg-slate-50" : "bg-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0",
                        isPending && "opacity-50 cursor-not-allowed"
                    )}
                    style={{ borderColor: isToys ? festamasPink : 'transparent' }} 
                >
                    <div className="relative h-5 w-16">
                        <Image src={iconFestamas} alt="Festamas" fill className="object-contain" />
                    </div>
                </button>
                <button 
                    disabled={isPending} 
                    onClick={() => handleDivisionChange('FIESTAS')} 
                    className={cn(
                        "relative h-full px-4 flex items-center justify-center gap-2 transition-all duration-300 border-b-[3px]",
                        !isToys ? "bg-slate-50" : "bg-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0",
                        isPending && "opacity-50 cursor-not-allowed"
                    )}
                    style={{ borderColor: !isToys ? '#eab308' : 'transparent' }} 
                >
                    <div className="relative h-5 w-16">
                        <Image src={iconFiestasYa} alt="FiestasYa" fill className="object-contain" />
                    </div>
                </button>
            </div>
            <div className="hidden md:flex items-center gap-4 text-slate-500 font-medium">
                <span>Venta Telefónica: (01) 615-6002</span>
                <span className="h-3 w-px bg-slate-300"></span>
                <Link href="/ayuda" className="hover:text-slate-800 transition-colors">Centro de Ayuda</Link>
            </div>
        </div>
      </div>

      {/* 2. NAVBAR PRINCIPAL */}
      <header 
        className={cn(
            "w-full py-4 shadow-sm sticky top-0 z-50 transition-all duration-300", 
            navbarStyleClass
        )}
      >
        <div className="w-full max-w-[1600px] mx-auto flex items-center gap-6 px-4 lg:px-8 relative">
          
          {/* LOGO */}
          <Link href="/" className="shrink-0 group hidden md:block mr-2">
             <div className="relative h-12 w-48 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image 
                    src={activeIconPath} 
                    alt={brandName} 
                    fill 
                    className="object-contain" 
                    priority 
                />
             </div>
          </Link>

          {/* BOTÓN CATEGORÍAS */}
          <div className="relative hidden md:block" ref={menuRef}>
            <Button 
                variant="ghost" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                    "flex flex-row items-center gap-2 h-11 px-6 font-bold tracking-wide border rounded-lg transition-all duration-200",
                    isMenuOpen ? activeMenuClass : buttonHoverClass
                )}
            >
                <span className="text-base">Categorías</span>
                <ChevronDown className={cn("h-5 w-5 stroke-[3] transition-transform duration-300", isMenuOpen && "rotate-180")} />
            </Button>

            {/* MENÚ DESPLEGABLE CATEGORIAS */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 origin-top-left z-60">
                    <nav className="flex flex-col py-1">
                        <Link 
                            href="/" 
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors font-bold text-sm",
                                dropdownBrandColor
                            )}
                        >
                            <Home className="w-4 h-4" /> Inicio
                        </Link>
                        {filteredCategories.map((cat) => (
                            <Link 
                                key={cat.id} 
                                href={`/category/${cat.slug}`} 
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "block px-4 py-3 hover:bg-slate-50 transition-colors text-slate-600 font-medium text-sm border-t border-slate-50 capitalize",
                                    dropdownHoverColor
                                )}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
          </div>

          {/* MENÚ MÓVIL */}
          <Button 
            variant="ghost" 
            className={cn("md:hidden flex items-center p-2", navTextClass)}
            onClick={() => setIsMobileMenuOpen(true)}
          >
             <Menu className="h-8 w-8" />
          </Button>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="w-[300px] p-0 z-[100]"> 
                <div className="flex flex-col h-full bg-white">
                    <div className="px-6 py-6 border-b bg-slate-50">
                        <div className="relative h-14 w-36">
                            <Image src={activeIconPath} alt={brandName} fill className="object-contain object-left" />
                        </div>
                    </div>
                    
                    {/* Usuario en Móvil */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      {user ? (
                         <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-white shadow-sm">
                                <AvatarImage src={user.image || ''} />
                                <AvatarFallback className={cn("font-bold", bgPrimaryLightClass, textPrimaryClass)}>
                                    {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-slate-800 truncate">{user.name}</span>
                                <span className="text-xs text-slate-500 truncate">{user.email}</span>
                            </div>
                         </div>
                      ) : (
                        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className={cn("w-full text-white", isToys ? "bg-[#fc4b65] hover:bg-[#e11d48]" : "bg-[#ec4899] hover:bg-[#be185d]")}>
                                Iniciar Sesión / Registrarse
                            </Button>
                        </Link>
                      )}
                    </div>

                    <nav className="flex-1 p-4 overflow-y-auto">
                        <Link 
                            href="/" 
                            onClick={() => setIsMobileMenuOpen(false)} 
                            className={cn("block p-3 border-b border-slate-50 text-lg font-bold", dropdownBrandColor)}
                        >
                            Inicio
                        </Link>
                        <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-2 p-3 border-b border-slate-50 text-slate-600 transition-colors", hoverPrimaryTextClass)}>
                            <Heart className="h-4 w-4" /> Favoritos {favoritesCount > 0 && `(${favoritesCount})`}
                        </Link>

                        {filteredCategories.map((cat) => (
                            <Link key={cat.id} href={`/category/${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} className={cn("block p-3 border-b border-slate-50 text-slate-700 text-lg capitalize transition-colors", hoverPrimaryTextClass)}>{cat.name}</Link>
                        ))}
                        
                        {/* Links extra para usuario móvil */}
                        {user && (
                            <>
                                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-2 p-3 border-b border-slate-50 text-slate-600 transition-colors", hoverPrimaryTextClass)}>
                                    <User className="h-4 w-4" /> Mi Perfil
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center gap-2 p-3 text-red-500 hover:bg-red-50 text-left">
                                    <LogOut className="h-4 w-4" /> Cerrar Sesión
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </SheetContent>
          </Sheet>

          {/* BUSCADOR */}
          <div className="flex-1 max-w-4xl hidden md:block mx-2">
             <Suspense>
                <SearchInput btnBgColor={searchBtnColor} iconColor={searchIconColor} isTransparent={!isToys} />
             </Suspense>
          </div>

          {/* ICONOS DERECHA */}
          <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-0">
              
              {/* 👤 USUARIO DROPDOWN */}
              <div className="relative hidden lg:block" ref={userMenuRef}>
                <Button 
                    variant="ghost" 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={cn(
                        "flex flex-row items-center gap-2 h-11 px-3 text-left border rounded-lg transition-all duration-200",
                        isUserMenuOpen ? activeMenuClass : buttonHoverClass
                    )}
                >
                    {user ? (
                        // Si está logueado: Avatar + Nombre
                        <>
                           <Avatar className="h-7 w-7 border border-white/20">
                                <AvatarImage src={user.image || ''} />
                                <AvatarFallback className={cn("text-[10px] font-bold", isToys ? "text-[#fc4b65] bg-white" : "text-white bg-[#ec4899]")}>
                                    {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col leading-none max-w-[100px]">
                                <span className="text-[10px] opacity-80 font-normal truncate">Hola,</span>
                                <span className="text-sm font-bold truncate">{user.name?.split(' ')[0]}</span>
                           </div>
                        </>
                    ) : (
                        // Si NO está logueado: Icono + "Inicia Sesión"
                        <>
                            <User className="h-6 w-6" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] opacity-80 font-normal">Hola,</span>
                                <span className="text-sm font-bold">Inicia Sesión</span>
                            </div>
                        </>
                    )}
                    <ChevronDown className={cn("h-3 w-3 opacity-70 ml-1 transition-transform", isUserMenuOpen && "rotate-180")} />
                </Button>

                {/* MENÚ DESPLEGABLE USUARIO */}
                {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 z-60">
                        {user ? (
                            // Opciones Logueado
                            <div className="flex flex-col py-1">
                                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                                <Link 
                                    href="/profile" 
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className={cn("flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors", hoverPrimaryTextClass)}
                                >
                                    <User className="h-4 w-4" /> Mi Perfil
                                </Link>
                                <Link 
                                    href="/favorites" 
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className={cn("flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors", hoverPrimaryTextClass)}
                                >
                                    <Heart className="h-4 w-4" /> Mis Favoritos
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <Link 
                                        href="/admin/dashboard" 
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className={cn("flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors", hoverPrimaryTextClass)}
                                    >
                                        <Settings className="h-4 w-4" /> Panel Admin
                                    </Link>
                                )}
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors"
                                >
                                    <LogOut className="h-4 w-4" /> Cerrar Sesión
                                </button>
                            </div>
                        ) : (
                            // Opciones Guest
                            <div className="flex flex-col py-1">
                                <Link 
                                    href="/auth/login" 
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className={cn("flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium", hoverPrimaryTextClass)}
                                >
                                    <LogIn className="h-4 w-4" /> Iniciar Sesión
                                </Link>
                                <Link 
                                    href="/auth/new-account" 
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className={cn("flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium", hoverPrimaryTextClass)}
                                >
                                    <UserPlus className="h-4 w-4" /> Crear Cuenta
                                </Link>
                            </div>
                        )}
                    </div>
                )}
              </div>

              <div className={cn("hidden lg:block h-8 w-px mx-1", isToys ? "bg-white/30" : "bg-slate-300")}></div>

              {/* ❤️ FAVORITOS (CORREGIDO: Usando wrapper relativo para el badge) */}
              <Link href="/favorites">
                <Button 
                    variant="ghost" 
                    className={cn(
                        "hidden md:flex relative h-11 px-4 border rounded-lg transition-all duration-200 group", 
                        buttonHoverClass
                    )}
                >
                    <div className="relative"> {/* 👈 WRAPPER CLAVE */}
                        <Heart className="h-6 w-6" />
                        {loaded && favoritesCount > 0 && (
                            <span className={cn(
                                "absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold shadow-sm ring-1 ring-white animate-in zoom-in",
                                badgeClass
                            )}>
                            {favoritesCount > 9 ? '+9' : favoritesCount}
                            </span>
                        )}
                    </div>
                </Button>
              </Link>

              {/* CARRITO */}
              <CartSidebar>
                <Button 
                    variant="ghost" 
                    className={cn(
                        "relative flex items-center gap-2 h-11 px-4 group border rounded-lg transition-all duration-200",
                        buttonHoverClass,
                        !isToys && "text-[#ec4899] group-hover:text-[#ec4899]"
                    )}
                >
                <div className="relative">
                    <ShoppingCart className="h-6 w-6" />
                    {loaded && getTotalItems() > 0 && (
                        <span className={cn(
                            "absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold shadow-sm ring-1 ring-white animate-in zoom-in",
                            badgeClass
                        )}>
                        {getTotalItems()}
                        </span>
                    )}
                </div>
                <div className="hidden xl:flex flex-col items-start leading-none ml-1">
                      <span className="text-sm font-bold">Carrito</span>
                </div>
                </Button>
              </CartSidebar>
          </div>
        </div>
        
        <div className="md:hidden px-4 pb-3 pt-1 relative z-50">
             <Suspense>
                <SearchInput btnBgColor={searchBtnColor} iconColor={searchIconColor} isTransparent={!isToys} className="shadow-none" />
             </Suspense>
        </div>
      </header>

      {/* BACKDROP */}
      {(isMenuOpen || isUserMenuOpen) && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-40 transition-opacity duration-300"
            onClick={() => { setIsMenuOpen(false); setIsUserMenuOpen(false); }}
        />
      )}

      {/* 3. SUB-HEADER */}
      <div className="hidden md:block w-full bg-white border-b border-slate-200 py-2 relative z-30">
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
                <button className={cn("flex items-center gap-2 text-slate-600 transition-colors group", hoverPrimaryTextClass)}>
                    <MapPin className={cn("h-5 w-5 text-slate-400", groupHoverPrimaryTextClass)} />
                    <span className="font-medium">Ingresa tu ubicación</span>
                </button>
                <Link href="/tiendas" className="text-slate-500 hover:text-slate-800 transition-colors">Nuestras Tiendas</Link>
            </div>
        </div>
      </div>
    </>
  );
}