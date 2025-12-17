import prisma from '@/lib/prisma';
import { ProductForm } from '@/components/features/ProductForm';
import { getAdminDivision } from '@/actions/admin-settings';

export default async function NewProductPage() {
  const division = await getAdminDivision();

  const categories = await prisma.category.findMany({
    where: { division },
    orderBy: { name: 'asc' }
  });

  return (
    // 👇 FIX: p-4 en móvil, p-8 en desktop
    <div className="p-4 md:p-8 w-full">
      <ProductForm 
        categories={categories} 
        defaultDivision={division}
        key={division} 
      />
    </div>
  );
}