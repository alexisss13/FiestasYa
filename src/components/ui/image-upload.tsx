'use client';

import { useEffect, useRef } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  
  // 1. SOLUCIÓN: Usamos useRef para tener siempre el estado "fresco"
  // Esto evita que el widget use una versión vieja del array al subir varias fotos seguidas
  const valueRef = useRef(value);

  // Mantenemos el ref sincronizado con el estado real
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpload = (result: any) => {
    // Al usar valueRef.current, aseguramos que tomamos TODAS las fotos actuales + la nueva
    onChange([...valueRef.current, result.info.secure_url]);
  };

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  return (
    <div>
      {/* Grilla para que las fotos se vean ordenadas */}
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {value.map((url) => (
          <div key={url} className="relative aspect-square w-full overflow-hidden rounded-md border border-slate-200 group">
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                type="button" 
                onClick={() => onRemove(url)} 
                variant="destructive" 
                size="icon"
                className="h-6 w-6 shadow-sm"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Image 
                fill 
                className="object-cover" 
                alt="Imagen producto" 
                src={url} 
            />
          </div>
        ))}
      </div>
      
      <CldUploadWidget 
        uploadPreset="fiestasya_preset"
        onSuccess={onUpload}
        options={{
            maxFiles: 5,
            resourceType: "image"
        }}
      >
        {({ open }) => {
          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={() => open()}
              className="w-full"
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Subir Imágenes
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}