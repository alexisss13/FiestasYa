'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

// Modificamos la firma de la función para aceptar 'query'
export async function getProducts({ 
  includeInactive = false, 
  query = '' // 👈 Nuevo parámetro opcional
} = {}) {
  try {
    // Construimos el filtro dinámicamente
    const whereClause: any = {};

    // 1. Filtro de Disponibilidad (Admin vs Public)
    if (!includeInactive) {
      whereClause.isAvailable = true;
    }

    // 2. Filtro de Búsqueda (Texto)
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } }, // Insensitive = da igual mayúsculas/minúsculas
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ... (El resto del mapeo 'cleanProducts' se queda EXACTAMENTE IGUAL)
    const cleanProducts: ProductWithCategory[] = products.map((product) => ({
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
      success: true,
      data: cleanProducts,
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

export async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug: slug,
        isAvailable: true,
      },
      include: {
        category: true,
      },
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
    };
  } catch (error) {
    console.log(error);
    throw new Error('Error al obtener el producto por slug');
  }
}

export async function getProductsByCategory(categorySlug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) return null;

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        isAvailable: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
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
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { 
        isAvailable: false,
        slug: `${id}-deleted`, 
      },
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/(shop)');
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'No se pudo eliminar el producto' };
  }
}