'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. Obtener lista de IDs favoritos (Nuevo)
export async function getFavoriteIds() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return [];
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true }, // Solo necesitamos el ID
  });

  return favorites.map(fav => fav.productId);
}

// 2. Toggle (Modificado para devolver el estado exacto)
export async function toggleFavorite(productId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { ok: false, message: 'Debes iniciar sesión' };
  }

  try {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          userId_productId: { userId, productId },
        },
      });
      revalidatePath('/');
      return { ok: true, isFavorite: false, message: 'Eliminado de favoritos' };
    } else {
      await prisma.favorite.create({
        data: { userId, productId },
      });
      revalidatePath('/');
      return { ok: true, isFavorite: true, message: 'Agregado a favoritos' };
    }

  } catch (error) {
    console.log(error);
    return { ok: false, message: 'Error al actualizar favoritos' };
  }
}