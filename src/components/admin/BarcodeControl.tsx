'use client';

import { Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import JsBarcode from 'jsbarcode';
import { toast } from 'sonner';

interface Props {
  barcode: string | null;
  title: string;
  price: number;
  // 👇 NUEVOS CAMPOS OPCIONALES
  wholesalePrice?: number | null;
  wholesaleMinCount?: number | null;
  discountPercentage?: number;
  
  className?: string;
  variant?: 'ghost' | 'outline' | 'secondary' | 'default';
}

export const BarcodeControl = ({ 
  barcode, 
  title, 
  price, 
  wholesalePrice, 
  wholesaleMinCount, 
  discountPercentage, 
  className, 
  variant = 'ghost' 
}: Props) => {
  
  if (!barcode) return null;

  const cleanFileName = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);

  // Helper para formatear dinero
  const fM = (amount: number) => amount.toFixed(2);

  const handleDownload = () => {
    try {
        // 1. Cálculos de Precios
        const discount = discountPercentage || 0;
        const hasDiscount = discount > 0;
        
        // El precio principal a mostrar es el precio FINAL unitario (con descuento aplicado)
        const activeUnitPrice = hasDiscount ? price * (1 - (discount / 100)) : price;
        
        const wPrice = Number(wholesalePrice) || 0;
        const hasWholesale = wPrice > 0;

        // 2. Crear canvas barras
        const tempCanvas = document.createElement('canvas');
        JsBarcode(tempCanvas, barcode, {
            format: "CODE128",
            width: 2,
            height: 45,          
            displayValue: true, 
            fontSize: 13,
            fontOptions: "bold",
            textMargin: 4,
            margin: 5,
            background: "#ffffff"
        });

        // 3. Dimensiones Canvas Final
        const titleFontSize = 14;
        const priceFontSize = 20; 
        const smallFontSize = 11;
        const padding = 10;
        
        const headerHeight = 30; // Título
        
        // Si hay mayorista, necesitamos más espacio abajo
        const footerHeight = hasWholesale ? 55 : 35; 

        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        
        if (!ctx) return;

        const finalWidth = Math.max(tempCanvas.width, 260);
        const finalHeight = tempCanvas.height + headerHeight + footerHeight + (padding * 2);

        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;

        // --- DIBUJAR ---
        
        // Fondo Blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalWidth, finalHeight);

        // Color Texto
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';

        // A. TÍTULO (Arriba)
        ctx.font = `bold ${titleFontSize}px Arial, sans-serif`;
        const displayTitle = title.length > 30 ? title.substring(0, 28) + '...' : title;
        ctx.fillText(displayTitle, finalWidth / 2, padding + 15);

        // B. CÓDIGO BARRAS (Centro)
        const xPos = (finalWidth - tempCanvas.width) / 2;
        ctx.drawImage(tempCanvas, xPos, headerHeight + padding);

        // C. PRECIO (Abajo)
        const bottomAreaStart = finalHeight - footerHeight + 15; // Un poco más abajo del centro del footer

        if (hasWholesale) {
            // Lógica compleja: Mostrar Unitario y Mayorista
            
            // Línea 1: Unitario (Negrita)
            ctx.font = `bold ${18}px Arial, sans-serif`;
            const unitText = hasDiscount ? `Oferta: S/ ${fM(activeUnitPrice)}` : `S/ ${fM(activeUnitPrice)}`;
            ctx.fillText(unitText, finalWidth / 2, bottomAreaStart - 10);

            // Línea 2: Mayorista (Más pequeño)
            ctx.font = `${smallFontSize}px Arial, sans-serif`;
            ctx.fillText(`Mayor: S/ ${fM(wPrice)} (Min ${wholesaleMinCount})`, finalWidth / 2, bottomAreaStart + 8);

        } else {
            // Lógica simple: Solo precio unitario grande
            ctx.font = `bold ${priceFontSize}px Arial, sans-serif`;
            
            if (hasDiscount) {
                ctx.fillText(`OFERTA: S/ ${fM(activeUnitPrice)}`, finalWidth / 2, bottomAreaStart);
            } else {
                ctx.fillText(`S/ ${fM(activeUnitPrice)}`, finalWidth / 2, bottomAreaStart);
            }
        }

        // 4. Descargar
        const url = finalCanvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = url;
        link.download = `tag-${cleanFileName(title)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Etiqueta generada");

    } catch (error) {
        console.error("Error generando etiqueta:", error);
        toast.error("Error al generar la imagen");
    }
  };

  return (
    <Button 
        type="button"
        variant={variant} 
        size="icon" 
        onClick={handleDownload}
        className={cn("text-slate-400 hover:text-slate-900 shrink-0", className)}
        title="Descargar Etiqueta (PNG)"
    >
        <div className="relative">
            <Barcode className="h-5 w-5" />
            {/* Indicador visual si tiene datos extra */}
            {((discountPercentage || 0) > 0 || (Number(wholesalePrice) > 0)) && (
               <div className="absolute -top-1 -right-1 rounded-full w-2 h-2 bg-blue-500 border border-white"></div>
            )}
        </div>
    </Button>
  );
};