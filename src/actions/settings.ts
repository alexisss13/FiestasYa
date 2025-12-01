'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const settingsSchema = z.object({
  whatsappPhone: z.string().min(9, "El número debe ser válido"),
  welcomeMessage: z.string().min(5, "El mensaje debe tener contenido"),
});

export async function getStoreConfig() {
  // Buscamos la primera configuración, si no existe, devolvemos default ficticio
  // (En el frontend manejaremos la creación si no existe)
  const config = await prisma.storeConfig.findFirst();
  return config || { whatsappPhone: '', welcomeMessage: '' };
}

export async function updateStoreConfig(data: z.infer<typeof settingsSchema>) {
  try {
    const valid = settingsSchema.parse(data);
    
    // Upsert: Si existe actualiza, si no existe crea.
    // Como no sabemos el ID, buscamos el primero o creamos.
    const existing = await prisma.storeConfig.findFirst();

    if (existing) {
      await prisma.storeConfig.update({
        where: { id: existing.id },
        data: valid,
      });
    } else {
      await prisma.storeConfig.create({
        data: valid,
      });
    }

    revalidatePath('/'); // Revalidar todo por si acaso
    return { success: true, message: 'Configuración guardada' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al guardar configuración' };
  }
}