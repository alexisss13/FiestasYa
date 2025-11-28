'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  
  // Manejar subida exitosa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpload = (result: any) => {
    onChange([...value, result.info.secure_url]);
  };

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative h-[200px] w-[200px] rounded-md overflow-hidden border">
            <div className="absolute top-2 right-2 z-10">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}
      </div>
      
      <CldUploadWidget 
        uploadPreset="fiestasya_preset" // ⚠️ ASEGÚRATE DE CREAR ESTE PRESET EN CLOUDINARY
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