'use server';

import prisma from '@/lib/prisma';
import { Prisma, Division } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { unstable_cache } from 'next/cache';

// Tipado fuerte para asegurar que el frontend reciba lo que espera
export type ProductWithCategory = {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  isAvailable: boolean;
  wholesalePrice: number;     
  wholesaleMinCount: number | null; 
  discountPercentage: number; 
  tags: string[];             
  division: Division;         
  createdAt: Date;
  category: {
    name: string;
    slug: string;
  };
};

const getOrderBy = (sort: string): Prisma.ProductOrderByWithRelationInput => {
    switch (sort) {
        case 'price_asc': return { price: 'asc' };
        case 'price_desc': return { price: 'desc' };
        case 'newest': return { createdAt: 'desc' };
        default: return { createdAt: 'desc' };
    }
};

// =====================================================================
// 1. GET PRODUCTS (Catálogo General con Filtros)
// =====================================================================
const getCachedProducts = unstable_cache(
  async (includeInactive: boolean, query: string, sort: string, division: Division) => {
    const whereClause: Prisma.ProductWhereInput = {};

    // Filtro por División (OBLIGATORIO)
    whereClause.division = division;

    if (!includeInactive) {
      whereClause.isAvailable = true;
    }

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } }
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: getOrderBy(sort),
    });

    // Mapeo completo
    return products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      isAvailable: product.isAvailable,
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : 0,
      wholesaleMinCount: product.wholesaleMinCount,
      discountPercentage: product.discountPercentage,
      tags: product.tags,
      division: product.division,
      createdAt: product.createdAt,
      category: {
        name: product.category.name,
        slug: product.category.slug,
      },
    }));
  },
  ['get-products-cache'], 
  {
    tags: ['products'], 
    revalidate: 3600
  }
);

interface GetProductsOptions {
    includeInactive?: boolean;
    query?: string;
    sort?: string;
    division?: Division;
}

export async function getProducts({ 
  includeInactive = false, 
  query = '', 
  sort = 'newest',
  division = 'JUGUETERIA'
}: GetProductsOptions = {}) {
  try {
    if (includeInactive) {
       // Modo Admin: Sin caché estricto
       const products = await prisma.product.findMany({
         where: division ? { division } : undefined,
         orderBy: getOrderBy(sort),
         include: { category: true }
       });
       
       const data = products.map(p => ({
         ...p,
         price: Number(p.price),
         wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : 0,
         category: { name: p.category.name, slug: p.category.slug }
       }));
       return { success: true, data };
    }

    // Modo Tienda: Usamos la versión cacheada
    const cachedData = await getCachedProducts(includeInactive, query, sort, division);
    
    return {
      success: true,
      data: cachedData,
    };
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return {
      success: false,
      message: 'No se pudieron cargar los productos.',
      data: [],
    };
  }
}

// =====================================================================
// 2. GET PRODUCT (Detalle Individual) - Renombrado a "getProduct"
// =====================================================================
export const getProduct = unstable_cache(
  async (slug: string) => {
    try {
      const product = await prisma.product.findFirst({
        where: { slug: slug, isAvailable: true }, // Usamos findFirst x seguridad
        include: { category: true },
      });

      if (!product) return null;

      return {
        ...product,
        price: Number(product.price),
        wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : 0,
        discountPercentage: product.discountPercentage,
        // Aseguramos que pasen todos los campos necesarios
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  ['get-single-product'],
  { tags: ['products'] }
);

// =====================================================================
// 3. GET PRODUCTS BY CATEGORY (¡RESTITUIDA!)
// =====================================================================
export const getProductsByCategory = unstable_cache(
  async (categorySlug: string, sort = 'newest') => {
    try {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) return null;

      const products = await prisma.product.findMany({
        where: { categoryId: category.id, isAvailable: true },
        include: { category: true },
        orderBy: getOrderBy(sort),
      });

      // Mapeo CRÍTICO: Incluir division y precios para que las Cards funcionen
      const cleanProducts = products.map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: Number(product.price),
        stock: product.stock,
        images: product.images,
        isAvailable: product.isAvailable,
        
        // Datos vitales para el nuevo diseño de tarjeta
        wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : 0,
        wholesaleMinCount: product.wholesaleMinCount,
        discountPercentage: product.discountPercentage,
        tags: product.tags,
        division: product.division,
        createdAt: product.createdAt,

        category: {
          name: product.category.name,
          slug: product.category.slug,
        },
      }));

      return {
        categoryName: category.name,
        products: cleanProducts,
        division: category.division 
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  ['get-products-by-category'],
  { tags: ['products', 'categories'] }
);

// =====================================================================
// 4. DELETE PRODUCT (Admin)
// =====================================================================
export async function deleteProduct(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { 
        isAvailable: false,
        slug: `${id}-deleted-${Date.now()}`, 
      },
    });
    
    revalidateTag('products'); 
    revalidatePath('/admin/products');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'No se pudo eliminar el producto' };
  }
}