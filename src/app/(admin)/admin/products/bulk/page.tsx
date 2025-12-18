import prisma from '@/lib/prisma';
import { getAdminDivision } from '@/actions/admin-settings';
import { BulkProductForm } from '@/components/admin/BulkProductForm';

export default async function BulkProductsPage() {
  const division = await getAdminDivision();

  // Traer solo categorías de la tienda activa para el dropdown
  const categories = await prisma.category.findMany({
    where: { division },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-4 md:p-8 w-full">
      <BulkProductForm 
        categories={categories} 
        division={division} 
      />
    </div>
  );
}