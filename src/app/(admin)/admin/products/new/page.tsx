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
    <div className="p-8 w-full">
      <ProductForm 
        categories={categories} 
        defaultDivision={division}
        // 👇 EL TRUCO MAESTRO: Esto fuerza el re-render total al cambiar tienda
        key={division} 
      />
    </div>
  );
}