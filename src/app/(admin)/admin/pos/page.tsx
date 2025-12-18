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
    // 👇 FIX: h-screen para altura exacta y -m-8 para romper el padding del AdminLayout
    <div className="w-auto h-screen -m-4 md:-m-8 bg-slate-50 overflow-hidden">
      <POSInterface 
        initialProducts={formattedProducts} 
        division={division} 
      />
    </div>
  );
}