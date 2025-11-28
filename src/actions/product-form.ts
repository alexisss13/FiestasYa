'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { productSchema } from '@/lib/zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createOrUpdateProduct(formData: z.infer<typeof productSchema>, id: string | null) {
  try {
    // 1. Validar datos en el backend
    const validatedFields = productSchema.safeParse(formData);

    if (!validatedFields.success) {
      return { success: false, message: 'Datos inválidos', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { title, slug, description, price, stock, categoryId, images, isAvailable } = validatedFields.data;

    // 2. Transacción de Base de Datos
    if (id) {
      // --- MODO EDICIÓN (UPDATE) ---
      await prisma.product.update({
        where: { id },
        data: {
          title,
          slug,
          description,
          price,
          stock,
          images, // Prisma sobrescribe el array
          isAvailable,
          categoryId
        }
      });
    } else {
      // --- MODO CREACIÓN (CREATE) ---
      // Verificar si el slug ya existe
      const existingProduct = await prisma.product.findUnique({ where: { slug } });
      if (existingProduct) {
        return { success: false, message: 'El slug ya existe. Usa otro.' };
      }

      await prisma.product.create({
        data: {
          title,
          slug,
          description,
          price,
          stock,
          images,
          isAvailable,
          categoryId
        }
      });
    }

    // 3. Revalidar Caché
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/(shop)');
    
    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error interno al guardar el producto' };
  }
}