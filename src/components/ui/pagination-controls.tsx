'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function PaginationControls({ totalPages, currentPage, hasNext, hasPrev }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-4 border-t border-slate-100 mt-4">
      <div className="text-sm text-slate-500">
        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrev}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          Siguiente <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}