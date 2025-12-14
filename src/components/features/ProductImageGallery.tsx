'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  title: string;
  isOutOfStock: boolean;
}

export function ProductImageGallery({ images, title, isOutOfStock }: Props) {
  // Manejamos el índice, no solo la URL, para poder calcular el "siguiente"
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Si no hay imágenes, validación de seguridad
  const safeImages = images.length > 0 ? images : [];
  const currentImage = safeImages[currentIndex];

  // 🔄 LÓGICA DE ROTACIÓN AUTOMÁTICA
  useEffect(() => {
    // Solo rotamos si hay más de 1 imagen y el usuario NO está interactuando
    if (safeImages.length <= 1 || isHovering) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % safeImages.length);
    }, 3500); // Rota cada 3.5 segundos

    return () => clearInterval(interval);
  }, [safeImages.length, isHovering]);


  if (safeImages.length === 0) {
     return (
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-slate-100 shadow-sm flex items-center justify-center text-slate-400">
            Sin imagen
        </div>
     );
  }

  return (
    <div 
        className="flex flex-col gap-4"
        onMouseEnter={() => setIsHovering(true)} // Pausa rotación
        onMouseLeave={() => setIsHovering(false)} // Reanuda rotación
    >
      {/* 1. IMAGEN PRINCIPAL */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-slate-50 shadow-sm group">
        <Image
          src={currentImage} 
          alt={title}
          fill
          className={cn(
            "object-cover transition-all duration-700", // Transición suave
            isOutOfStock ? "opacity-50 grayscale" : "group-hover:scale-105"
          )}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Indicador de progreso visual (puntos superpuestos) */}
        {safeImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {safeImages.map((_, idx) => (
                    <div 
                        key={idx}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                            idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/60"
                        )}
                    />
                ))}
            </div>
        )}

        {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/40 backdrop-blur-[2px]">
                <Badge variant="destructive" className="text-xl px-6 py-2 pointer-events-none border-2 border-white shadow-lg">
                    AGOTADO
                </Badge>
            </div>
        )}
      </div>

      {/* 2. CARRUSEL DE MINIATURAS */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x py-1">
            {safeImages.map((img, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                        "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all snap-start",
                        (index === currentIndex)
                            ? "border-slate-900 shadow-md scale-105 z-10 ring-2 ring-slate-200 ring-offset-1" 
                            : "border-transparent opacity-70 hover:opacity-100 hover:border-slate-300"
                    )}
                >
                    <Image 
                        src={img} 
                        alt={`Vista ${index + 1}`} 
                        fill 
                        className="object-cover"
                    />
                </button>
            ))}
        </div>
      )}
    </div>
  );
}