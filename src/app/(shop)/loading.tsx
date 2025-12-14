import { ProductGridSkeleton } from "@/components/features/Skeletons";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
        {/* Cabecera Falsa */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-6">
            <div className="space-y-4 w-full">
                <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-full max-w-md bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" /> {/* Sort Falso */}
        </div>

        {/* Grilla Falsa */}
        <ProductGridSkeleton />
    </div>
  );
}