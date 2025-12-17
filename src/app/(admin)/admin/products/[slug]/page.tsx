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
  
  // Buscamos el producto y las categorías
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) {
    notFound();
  }
  
  // 🛠️ SERIALIZACIÓN: Convertimos los objetos complejos a tipos simples (JS)
  const formattedProduct = {
    ...product,
    price: Number(product.price), // Decimal -> Number
    wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null, // Decimal? -> Number | null
    // Los campos opcionales a veces vienen como null, los pasamos a undefined si es necesario
    color: product.color ?? undefined,
    groupTag: product.groupTag ?? undefined,
  };

  return (
    <div className="p-8 w-full">
      <ProductForm 
        categories={categories} 
        // 👇 Corregido: Tu componente espera 'product', no 'initialData'
        // Usamos 'as any' porque TS espera Decimal y le damos Number (truco válido aquí)
        product={formattedProduct as any} 
        key={product.id} // Forza el refresco si cambias de producto
      />
    </div>
  );
}