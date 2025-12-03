'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- HERO CONFIG ---
const heroSchema = z.object({
  heroImage: z.string().optional(),
  heroTitle: z.string().min(1, "El título es obligatorio"),
  heroSubtitle: z.string().optional(),
  heroButtonText: z.string().optional(),
  heroButtonLink: z.string().optional(),
});

export async function updateHeroConfig(data: z.infer<typeof heroSchema>) {
  try {
    const config = await prisma.storeConfig.findFirst();
    
    if (config) {
      await prisma.storeConfig.update({
        where: { id: config.id },
        data: data,
      });
    } else {
      // Si no existe, creamos uno base
      await prisma.storeConfig.create({
        data: {
            ...data,
            whatsappPhone: "519999999", 
            welcomeMessage: "Hola..."
        }
      });
    }
    
    revalidatePath('/'); // Refrescar Home
    return { success: true, message: "Portada actualizada" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error al guardar" };
  }
}

// --- BANNERS CRUD ---
const bannerSchema = z.object({
  title: z.string().min(3, "Título muy corto"),
  image: z.string().min(1, "La imagen es obligatoria"),
  link: z.string().min(1, "El link es obligatorio"),
});

export async function getBanners(onlyActive = false) {
  return await prisma.banner.findMany({
    where: onlyActive ? { isActive: true } : {},
    orderBy: { createdAt: 'desc' } // Los más nuevos primero
  });
}

export async function createBanner(data: z.infer<typeof bannerSchema>) {
  try {
    await prisma.banner.create({ data });
    revalidatePath('/');
    revalidatePath('/admin/design');
    return { success: true };
  } catch (e) { return { success: false, message: "Error al crear banner" }; }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/design');
    return { success: true };
  } catch (e) { return { success: false, message: "Error al eliminar" }; }
}