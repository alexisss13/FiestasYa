'use server';

import prisma from '@/lib/prisma';
import { productSchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';

export async function createOrUpdateProduct(formData: FormData, id?: string) {
  const data = Object.fromEntries(formData.entries());
  
  // FIX: Obtenemos todas las imágenes, filtramos strings vacíos
  const images = formData.getAll('images').filter(img => typeof img === 'string' && img.length > 0) as string[];

  // 🧹 SANITIZACIÓN DE DATOS (NUEVO)
  // Convertimos groupTag a Mayúsculas y quitamos espacios para asegurar coincidencia
  const rawGroupTag = data.groupTag?.toString().trim().toUpperCase();
  const groupTag = rawGroupTag && rawGroupTag.length > 0 ? rawGroupTag : null;

  // Limpiamos el color
  const rawColor = data.color?.toString().trim();
  const color = rawColor && rawColor.length > 0 ? rawColor : null;

  // Preparar objeto crudo para Zod
  const rawData = {
    ...data,
    images: images,
    isAvailable: formData.get('isAvailable') === 'on',
    
    // FIX: Conversión robusta de numéricos
    price: data.price === '' ? 0 : data.price,
    stock: data.stock === '' ? 0 : data.stock,
    discountPercentage: data.discountPercentage === '' ? 0 : data.discountPercentage,
    wholesalePrice: data.wholesalePrice === '' ? null : data.wholesalePrice,
    wholesaleMinCount: data.wholesaleMinCount === '' ? null : data.wholesaleMinCount,
    
    // Inyectamos los valores limpios
    groupTag: groupTag ?? undefined, // undefined para que Zod lo tome como opcional si es null
    color: color ?? undefined,
  };

  const parsed = productSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { 
    title, slug, description, price, stock, categoryId, isAvailable, 
    division, wholesalePrice, wholesaleMinCount, discountPercentage, tags 
  } = parsed.data;

  // FIX: Procesar tags de búsqueda correctamente
  const tagsArray = tags 
    ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '')
    : [];

  try {
    const productData = {
      title,
      slug,
      description,
      price,
      stock,
      categoryId,
      images,
      isAvailable,
      color,      // Valor limpio (puede ser null)
      groupTag,   // Valor limpio (puede ser null)
      division,
      wholesalePrice,
      wholesaleMinCount,
      discountPercentage,
      tags: tagsArray
    };

    if (id) {
      await prisma.product.update({ where: { id }, data: productData });
    } else {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) return { success: false, error: 'El slug ya existe.' };
      await prisma.product.create({ data: productData });
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error DB:", error);
    return { success: false, error: 'Error al guardar en base de datos.' };
  }
}