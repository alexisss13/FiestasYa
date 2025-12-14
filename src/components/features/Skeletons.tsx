import { Skeleton } from "@/components/ui/skeleton";

// 1. Tarjeta de Producto Individual (Falsa)
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      {/* Imagen cuadrada */}
      <Skeleton className="aspect-square w-full rounded-xl" />
      
      {/* Textos */}
      <div className="space-y-2 px-1">
        <Skeleton className="h-4 w-2/3" /> {/* Título */}
        <Skeleton className="h-4 w-1/3" /> {/* Precio */}
      </div>
      
      {/* Botón */}
      <Skeleton className="h-9 w-full rounded-md mt-2" />
    </div>
  );
}

// 2. Grilla de Productos (Para Home y Categorías)
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Generamos 8 tarjetas falsas */}
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// 3. Detalle de Producto (Para la página individual)
export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
        
        {/* Columna Izquierda: Imagen Grande */}
        <Skeleton className="aspect-square w-full rounded-xl" />

        {/* Columna Derecha: Info */}
        <div className="flex flex-col justify-center space-y-6">
          <Skeleton className="h-6 w-24 rounded-full" /> {/* Badge Categoría */}
          <Skeleton className="h-10 w-3/4" /> {/* Título Grande */}
          <Skeleton className="h-8 w-32" /> {/* Precio */}
          
          <div className="space-y-2"> {/* Descripción */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="flex gap-4 pt-4"> {/* Botones */}
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}