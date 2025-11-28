import prisma from '@/lib/prisma';
import { ProductForm } from '@/components/features/ProductForm';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany();

  return (
    <div className="p-8">
      <ProductForm categories={categories} initialData={null} />
    </div>
  );
}