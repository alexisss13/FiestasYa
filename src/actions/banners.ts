'use server';

import prisma from '@/lib/prisma';
import { BannerPosition, Division } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Esquema de validación para el servidor (opcional pero recomendado)
interface BannerData {
  title: string;
  imageUrl: string;
  mobileUrl?: string;
  link?: string;
  position: BannerPosition;
  division: Division;
}

export async function createBanner(data: BannerData) {
  try {
    const banner = await prisma.banner.create({
      data: {
        ...data,
        active: true,
        order: 0, // Se pone al principio o final según lógica, aquí 0 por defecto
      },
    });
    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true, data: banner };
  } catch (error) {
    console.error('Error createBanner:', error);
    return { success: false, error: 'Error al crear el banner.' };
  }
}

export async function updateBanner(id: string, data: Partial<BannerData>) {
  try {
    const banner = await prisma.banner.update({
      where: { id },
      data,
    });
    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true, data: banner };
  } catch (error) {
    console.error('Error updateBanner:', error);
    return { success: false, error: 'Error al actualizar el banner.' };
  }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true };
  } catch (error) {
    console.error('Error deleteBanner:', error);
    return { success: false, error: 'Error al eliminar el banner.' };
  }
}

export async function getAdminBanners() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' }, // Ordenamos por el campo 'order'
    });
    return { success: true, data: banners };
  } catch (error) {
    console.error('Error getAdminBanners:', error);
    return { success: false, error: 'Error al obtener banners.' };
  }
}

export async function reorderBanners(items: { id: string; order: number }[]) {
  try {
    // Transacción para asegurar integridad
    await prisma.$transaction(
      items.map((item) =>
        prisma.banner.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true };
  } catch (error) {
    console.error('Error reorderBanners:', error);
    return { success: false, error: 'Error al reordenar.' };
  }
}