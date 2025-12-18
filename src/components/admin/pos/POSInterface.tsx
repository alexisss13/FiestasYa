'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Division } from '@prisma/client';
import { usePOSStore } from '@/store/pos-store';
import { consultDni } from '@/actions/reniec';
import { searchProductsPOS } from '@/actions/products';
import { useDebouncedCallback } from 'use-debounce';
import { 
  Search, ScanBarcode, Trash2, Plus, Minus, 
  CreditCard, User, ShoppingCart, Loader2, Eraser, 
  Banknote, QrCode 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn, formatCurrency } from '@/lib/utils';

// Tipos
type POSProduct = {
    id: string;
    title: string;
    price: number;
    stock: number;
    images: string[];
    barcode: string | null;
    wholesalePrice?: number | null;
    wholesaleMinCount?: number | null;
    discountPercentage?: number;
};

interface Props {
  initialProducts: any[]; 
  division: Division;
}

export const POSInterface = ({ initialProducts, division }: Props) => {
  const isFestamas = division === 'JUGUETERIA';
  const brandBg = isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90";
  const brandText = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";
  const brandRing = isFestamas ? "focus-visible:ring-festamas-primary" : "focus-visible:ring-fiestasya-accent";
  
  // 💧 SOLUCIÓN HYDRATION: Esperar montaje
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Estados
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<POSProduct[]>(initialProducts);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'YAPE' | 'PLIN' | 'EFECTIVO' | 'TARJETA'>('EFECTIVO');
  
  const [loadingDni, setLoadingDni] = useState(false);

  const { 
    cart, customer, addToCart, removeFromCart, updateQuantity, 
    setCustomer, clearCart, clearCustomer, getTotal, getItemsCount, getItemActivePrice 
  } = usePOSStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 🔍 BÚSQUEDA
  const handleSearch = useDebouncedCallback(async (term: string) => {
    if (!term) {
        setProducts(initialProducts);
        return;
    }
    setLoadingSearch(true);
    const results = await searchProductsPOS(term, division);
    setProducts(results as any[]);
    setLoadingSearch(false);
  }, 300);

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch]);

  // 🔫 ESCÁNER
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const char = e.key;
      const currentTime = Date.now();

      if (currentTime - lastKeyTime > 50) buffer = ''; 
      lastKeyTime = currentTime;

      if (char === 'Enter') {
        if (buffer.length > 3) { 
          setLoadingSearch(true);
          const results = await searchProductsPOS(buffer, division);
          setLoadingSearch(false);
          
          if (results.length > 0) {
             const product = results[0];
             if (product.stock > 0) {
                addToCart(product as any);
                toast.success(`Escaneado: ${product.title}`);
                setQuery('');
             } else {
                toast.error("Sin stock");
             }
          } else {
             toast.error("Producto no encontrado");
          }
          buffer = '';
        }
      } else if (char.length === 1) {
        buffer += char;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addToCart, division]);

  const handleDniSearch = async () => {
    if (customer.dni.length < 8) {
        toast.error("DNI inválido");
        return;
    }
    setLoadingDni(true);
    const res = await consultDni(customer.dni);
    if (res.success && res.data) {
        setCustomer({ name: res.data.fullName });
        toast.success("Cliente encontrado");
    } else {
        toast.warning(res.message);
    }
    setLoadingDni(false);
  };

  const handleProcessSale = () => {
      console.log("Procesando venta...", { cart, customer, paymentMethod, total: getTotal() });
      toast.success(`Venta registrada con ${paymentMethod}`);
      clearCart();
      clearCustomer();
      setIsCheckoutOpen(false);
  };

  if (!isMounted) return null;

  return (
    // 📏 LAYOUT FLEX: Ocupa el 100% de la altura disponible del contenedor padre
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4 bg-slate-50/50">
      
      {/* 👈 IZQUIERDA: CATÁLOGO */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
        
        {/* HEADER: Buscador */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center shrink-0">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                    ref={searchInputRef}
                    placeholder="Buscar producto (F1 para enfocar)" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={cn("pl-10 h-11 text-lg bg-slate-50 border-slate-200", brandRing)}
                    autoFocus
                />
            </div>
            <Button size="icon" variant="outline" className="md:hidden shrink-0 h-11 w-11" onClick={() => toast.info("Cámara pronto")}>
                <ScanBarcode className="h-6 w-6 text-slate-600" />
            </Button>
        </div>

        {/* GRID PRODUCTOS */}
        <ScrollArea className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 min-h-[300px]">
                    <Search className="h-12 w-12 mb-2 opacity-20" />
                    <p>No se encontraron productos</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-20 md:pb-0">
                    {products.map((product) => (
                        <button 
                            key={product.id}
                            onClick={() => product.stock > 0 ? addToCart(product as any) : toast.error("Sin stock")}
                            className={cn(
                                "flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden active:scale-[0.98] transition-all hover:shadow-md text-left relative h-full",
                                product.stock <= 0 && "opacity-60 grayscale"
                            )}
                        >
                            <div className="aspect-square relative bg-slate-100 border-b border-slate-100">
                                {product.images[0] ? (
                                    <Image src={product.images[0]} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full"><ScanBarcode className="h-8 w-8 text-slate-300"/></div>
                                )}
                                <div className="absolute top-1 right-1 flex flex-col items-end gap-1">
                                    <Badge className={cn("px-1.5 py-0 text-[10px] shadow-sm", product.stock > 0 ? "bg-white text-slate-700 hover:bg-white" : "bg-red-500 text-white")}>
                                        {product.stock}
                                    </Badge>
                                    {(product.discountPercentage ?? 0) > 0 && (
                                        <Badge className={cn("px-1.5 py-0 text-[10px] text-white border-none", isFestamas ? "bg-red-500" : "bg-pink-500")}>
                                            -{product.discountPercentage}%
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="p-2.5 flex flex-col justify-between flex-1 gap-1">
                                <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-tight min-h-[2.5em]">{product.title}</p>
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        {(product.discountPercentage ?? 0) > 0 && (
                                            <span className="text-[10px] text-slate-400 line-through">
                                                {formatCurrency(Number(product.price))}
                                            </span>
                                        )}
                                        <span className={cn("font-bold text-sm", brandText)}>
                                            {formatCurrency(Number(product.price) * (1 - (product.discountPercentage || 0) / 100))}
                                        </span>
                                    </div>
                                    {(product.wholesalePrice && product.wholesalePrice > 0) && (
                                        <span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded" title={`Mínimo: ${product.wholesaleMinCount}`}>
                                            May: {formatCurrency(Number(product.wholesalePrice))}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </ScrollArea>
      </div>

      {/* 👉 DERECHA: TICKET Y CLIENTE */}
      <div className="hidden lg:flex flex-col w-[380px] xl:w-[420px] gap-4 shrink-0 h-full overflow-hidden">
        
        {/* SECCIÓN CLIENTE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <User className={cn("h-5 w-5", brandText)} /> Cliente
                </div>
                <Button variant="ghost" size="sm" onClick={clearCustomer} className="h-6 text-slate-400 hover:text-red-500 text-xs px-2">
                    <Eraser className="h-3 w-3 mr-1"/> Limpiar
                </Button>
            </div>
            
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input 
                        placeholder="DNI (8 dígitos)" 
                        value={customer.dni}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                            setCustomer({ dni: val });
                        }}
                        className="font-mono bg-slate-50 border-slate-200"
                        maxLength={8}
                    />
                    {loadingDni && (
                        <div className="absolute right-2 top-2.5">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        </div>
                    )}
                </div>
                <Button onClick={handleDniSearch} disabled={loadingDni || customer.dni.length !== 8} size="icon" variant="secondary" className="border border-slate-200 shadow-sm">
                    <Search className="h-4 w-4" />
                </Button>
            </div>

            <Input 
                placeholder="Nombre del Cliente" 
                value={customer.name}
                onChange={(e) => setCustomer({ name: e.target.value })}
                className="bg-slate-50 border-slate-200"
            />
        </div>

        {/* LISTA CARRITO */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                    <ShoppingCart className="h-4 w-4" /> Items <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center bg-white border border-slate-200 text-slate-600">{getItemsCount()}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 text-xs px-2">
                    <Trash2 className="h-3 w-3 mr-1"/> Vaciar
                </Button>
            </div>

            <ScrollArea className="flex-1 p-2 h-full">
                <CartList 
                    cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} 
                    getItemActivePrice={getItemActivePrice}
                />
            </ScrollArea>

            {/* TOTALES */}
            <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 shrink-0">
                <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(getTotal() / 1.18)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>IGV (18%)</span>
                        <span>{formatCurrency(getTotal() - (getTotal() / 1.18))}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-2"/>
                    <div className="flex justify-between text-2xl font-black text-slate-900 items-end">
                        <span className="text-sm font-medium text-slate-500 mb-1">Total</span>
                        <span>{formatCurrency(getTotal())}</span>
                    </div>
                </div>

                <Button 
                    className={cn("w-full h-12 text-base font-bold shadow-lg transition-all active:scale-[0.98]", brandBg)} 
                    onClick={() => setIsCheckoutOpen(true)}
                    disabled={cart.length === 0}
                >
                    <CreditCard className="mr-2 h-5 w-5" /> 
                    Cobrar
                </Button>
            </div>
        </div>
      </div>

      {/* 📱 BOTÓN FLOTANTE MÓVIL */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        {cart.length > 0 && (
            <Button 
                onClick={() => setIsCheckoutOpen(true)}
                className={cn("w-full h-14 shadow-2xl flex justify-between items-center text-lg px-6 rounded-full border border-white/20", brandBg)}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white text-slate-900 px-2.5 py-0.5 rounded-full text-sm font-bold shadow-sm">{getItemsCount()}</div>
                    <span className="font-semibold">Ver Carrito</span>
                </div>
                <span className="font-black tracking-tight">{formatCurrency(getTotal())}</span>
            </Button>
        )}
      </div>

      {/* 🧾 MODAL DE CHECKOUT (Unificado) */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0 border-none shadow-2xl">
            {/* Header con color de marca */}
            <DialogHeader className={cn("p-4 text-white", brandBg)}>
                <DialogTitle className="flex items-center gap-2 text-lg">
                    <ShoppingCart className="h-5 w-5" /> Resumen de Venta
                </DialogTitle>
            </DialogHeader>
            
            {/* CLIENTE EN MÓVIL (Dentro del modal) */}
            <div className="p-4 bg-white border-b border-slate-100 lg:hidden space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Datos del Cliente</p>
                <div className="flex gap-2">
                    <div className="relative w-32 shrink-0">
                        <Input 
                            placeholder="DNI" 
                            value={customer.dni}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                setCustomer({ dni: val });
                            }}
                            className="font-mono h-9 text-sm"
                            maxLength={8}
                        />
                        {loadingDni && <Loader2 className="absolute right-2 top-2.5 h-3 w-3 animate-spin text-slate-400" />}
                    </div>
                    <Button onClick={handleDniSearch} disabled={loadingDni || customer.dni.length < 8} size="sm" variant="secondary" className="h-9 px-3">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Input 
                        placeholder="Nombre" 
                        value={customer.name}
                        onChange={(e) => setCustomer({ name: e.target.value })}
                        className="h-9 text-sm flex-1"
                    />
                </div>
            </div>

            <div className="max-h-[30vh] overflow-y-auto p-4 bg-slate-50">
                <CartList 
                    cart={cart} 
                    updateQuantity={updateQuantity} 
                    removeFromCart={removeFromCart} 
                    getItemActivePrice={getItemActivePrice}
                />
            </div>

            <div className="p-5 bg-white border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Método de Pago</p>
                <Tabs defaultValue="EFECTIVO" onValueChange={(v) => setPaymentMethod(v as any)} className="w-full mb-6">
                    <TabsList className="grid grid-cols-4 h-auto p-1 bg-slate-100 border border-slate-200 rounded-lg">
                        <TabsTrigger value="EFECTIVO" className="flex flex-col gap-1 py-3 text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                            <Banknote className="h-5 w-5 text-emerald-600"/> Efectivo
                        </TabsTrigger>
                        <TabsTrigger value="YAPE" className="flex flex-col gap-1 py-3 text-[10px] data-[state=active]:bg-[#742284] data-[state=active]:text-white rounded-md transition-all">
                            <QrCode className="h-5 w-5"/> Yape
                        </TabsTrigger>
                        <TabsTrigger value="PLIN" className="flex flex-col gap-1 py-3 text-[10px] data-[state=active]:bg-[#00d3eb] data-[state=active]:text-white rounded-md transition-all">
                            <QrCode className="h-5 w-5"/> Plin
                        </TabsTrigger>
                        <TabsTrigger value="TARJETA" className="flex flex-col gap-1 py-3 text-[10px] data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-md transition-all">
                            <CreditCard className="h-5 w-5"/> Tarjeta
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex justify-between items-end mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Total a Cobrar</span>
                    <span className="text-3xl font-black text-slate-900">{formatCurrency(getTotal())}</span>
                </div>

                <Button 
                    className={cn("w-full h-14 text-lg font-bold shadow-lg hover:scale-[1.01] transition-transform", brandBg)} 
                    onClick={handleProcessSale}
                    disabled={cart.length === 0}
                >
                    Confirmar Pago
                </Button>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

// --- COMPONENTE LISTA CARRITO ---
const CartList = ({ cart, updateQuantity, removeFromCart, getItemActivePrice }: any) => (
    <div className="space-y-2">
        {cart.length === 0 && <p className="text-center text-slate-400 text-sm py-8">El carrito está vacío</p>}
        {cart.map((item: any) => {
            const activePrice = getItemActivePrice(item);
            const isWholesale = activePrice === Number(item.wholesalePrice);
            const isDiscounted = item.discountPercentage > 0 && !isWholesale;

            return (
                <div key={item.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
                    {/* Indicador de Tipo de Precio */}
                    {isWholesale && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" title="Precio Mayorista"/>}
                    {isDiscounted && <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500" title="Oferta"/>}

                    <div className="h-11 w-11 relative rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                        {item.images[0] && <Image src={item.images[0]} alt="" fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0 pl-1">
                        <p className="text-xs font-bold text-slate-700 truncate mb-0.5">{item.title}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-[11px] font-medium text-slate-600">{formatCurrency(activePrice)}</p>
                            {isWholesale && <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Mayorista</Badge>}
                            {isDiscounted && <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] bg-pink-100 text-pink-700 hover:bg-pink-100 border-none">-{item.discountPercentage}%</Badge>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 tabular-nums w-14 text-right">
                            {formatCurrency(activePrice * item.quantity)}
                        </p>
                        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-md h-8">
                            <button className="w-8 h-full flex items-center justify-center hover:bg-white text-slate-500 rounded-l-md active:bg-slate-200 transition-colors" onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}>
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold tabular-nums bg-white h-full flex items-center justify-center border-x border-slate-200">{item.quantity}</span>
                            <button className="w-8 h-full flex items-center justify-center hover:bg-white text-slate-500 rounded-r-md active:bg-slate-200 transition-colors disabled:opacity-50" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);