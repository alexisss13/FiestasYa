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
  
  // Transformamos los datos para que TypeScript no llore
  const formattedProduct = {
    ...product,
    price: Number(product.price),
    // 👇 EL TRUCO: Convertir null a undefined usando '??'
    color: product.color ?? undefined,
    groupTag: product.groupTag ?? undefined,
  };

  return (
    <div className="p-8">
      <ProductForm categories={categories} initialData={formattedProduct} />
    </div>
  );
}