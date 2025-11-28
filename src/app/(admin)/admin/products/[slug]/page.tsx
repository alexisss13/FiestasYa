import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/features/ProductForm';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditProductPage({ params }: Props) {
  const { slug } = await params;
  
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.category.findMany(),
  ]);

  if (!product) {
    notFound();
  }
  
  // Transformamos el Decimal a number para el formulario
  const formattedProduct = {
    ...product,
    price: Number(product.price),
  };

  return (
    <div className="p-8">
      <ProductForm categories={categories} initialData={formattedProduct} />
    </div>
  );
}