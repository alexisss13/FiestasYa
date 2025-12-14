'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { unstable_cache } from 'next/cache';

export type ProductWithCategory = {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  isAvailable: boolean;
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

// --- VERSIÓN CACHEADA ---
const getCachedProducts = unstable_cache(
  async (includeInactive: boolean, query: string, sort: string) => {
    const whereClause: Prisma.ProductWhereInput = {};

    if (!includeInactive) {
      whereClause.isAvailable = true;
    }

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: getOrderBy(sort),
    });

    return products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      isAvailable: product.isAvailable,
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

// --- SERVER ACTION PÚBLICO ---
export async function getProducts({ 
  includeInactive = false, 
  query = '', 
  sort = 'newest'
} = {}) {
  try {
    if (includeInactive) {
       const products = await prisma.product.findMany({
         orderBy: getOrderBy(sort),
         include: { category: true }
       });
       
       const data = products.map(p => ({
         ...p,
         price: Number(p.price),
         category: { name: p.category.name, slug: p.category.slug }
       }));
       return { success: true, data };
    }

    const cachedData = await getCachedProducts(includeInactive, query, sort);
    
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

export const getProduct = unstable_cache(
  async (slug: string) => {
    try {
      const product = await prisma.product.findFirst({
        where: { slug: slug, isAvailable: true },
        include: { category: true },
      });

      if (!product) return null;

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        slug: product.slug,
        price: Number(product.price),
        stock: product.stock,
        images: product.images,
        isAvailable: product.isAvailable,
        category: {
          name: product.category.name,
          slug: product.category.slug,
        },
        color: product.color,
        groupTag: product.groupTag
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  ['get-single-product'], 
  { tags: ['products'] }
);

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

      const cleanProducts = products.map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: Number(product.price),
        stock: product.stock,
        images: product.images,
        isAvailable: product.isAvailable,
        category: {
          name: product.category.name,
          slug: product.category.slug,
        },
      }));

      return {
        categoryName: category.name,
        products: cleanProducts,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  ['get-products-by-category'],
  { tags: ['products', 'categories'] }
);

export async function deleteProduct(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { 
        isAvailable: false,
        slug: `${id}-deleted`, 
      },
    });
    
    // ⚠️ CORRECCIÓN: Agregamos 'default' como segundo argumento
    revalidateTag('products', 'default'); 
    
    revalidatePath('/admin/products');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'No se pudo eliminar el producto' };
  }
}