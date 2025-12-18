import prisma from '@/lib/prisma';
import { getAdminDivision } from '@/actions/admin-settings';
import { POSInterface } from '@/components/admin/pos/POSInterface';

export default async function POSPage() {
  const division = await getAdminDivision();

  const products = await prisma.product.findMany({
    where: { 
        division,
        isAvailable: true 
    },
    take: 50,
    select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        images: true,
        barcode: true,
        slug: true,
        wholesalePrice: true,
        wholesaleMinCount: true,
        discountPercentage: true,
        category: { select: { name: true, slug: true } }
    },
    orderBy: { title: 'asc' }
  });

  const formattedProducts = products.map(p => ({
    ...p,
    price: Number(p.price),
    wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : 0,
  }));

  return (
    // 🎨 FIX LAYOUT: Rompemos el padding del padre con márgenes negativos
    <div className="w-auto h-[calc(100vh-64px)] -m-8 relative overflow-hidden bg-slate-50">
      <POSInterface 
        initialProducts={formattedProducts} 
        division={division} 
      />
    </div>
  );
}