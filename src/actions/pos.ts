'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/auth';

const posOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
  total: z.number().min(0),
  paymentMethod: z.enum(['YAPE', 'PLIN', 'EFECTIVO', 'TARJETA']),
  division: z.string().optional(),
  customer: z.object({
    name: z.string().optional(),
    dni: z.string().optional(),
    address: z.string().optional(),
  }),
});

export async function processPOSSale(data: z.infer<typeof posOrderSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, message: 'No autorizado: Debes iniciar sesión para vender.' };
    }
    const sellerName = session.user.name || session.user.email;

    const validation = posOrderSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: 'Datos de venta inválidos' };
    }

    const { items, total, paymentMethod, customer, division } = data;

    // 1. Validar Stock
    const productIds = items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    for (const item of items) {
      const dbProduct = dbProducts.find(p => p.id === item.productId);
      if (!dbProduct) {
        return { success: false, message: `Producto no encontrado: ID ${item.productId}` };
      }
      if (dbProduct.stock < item.quantity) {
        return { 
          success: false, 
          message: `Stock insuficiente para "${dbProduct.title}". Quedan: ${dbProduct.stock}` 
        };
      }
    }

    // 2. Transacción (Crear Orden + Generar Correlativo + Restar Stock)
    const order = await prisma.$transaction(async (tx) => {
      // --- LÓGICA DE CORRELATIVO ---
      // Contamos cuántas órdenes tienen número de boleta para generar el siguiente
      // OJO: Esto asume Serie B001 única para todos. Si quisieras separar series por tienda, filtraríamos aquí.
      const lastOrder = await tx.order.findFirst({
        where: { receiptNumber: { not: null } },
        orderBy: { createdAt: 'desc' } // Buscamos la última creada
      });

      // Si la última fue B001-00000045, extraemos 45. Si no hay, empezamos en 1.
      let nextNumber = 1;
      if (lastOrder && lastOrder.receiptNumber) {
        const parts = lastOrder.receiptNumber.split('-');
        const sequence = parseInt(parts[1]);
        if (!isNaN(sequence)) {
          nextNumber = sequence + 1;
        }
      }

      // Formato: B001-00000001 (PadStart rellena con ceros a la izquierda)
      const newReceiptNumber = `B001-${nextNumber.toString().padStart(8, '0')}`;
      // -----------------------------

      const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
      const notes = `
        [VENTA POS]
        Vendedor: ${sellerName}
        Pago: ${paymentMethod}
        Tienda: ${division || 'General'}
        DNI Cliente: ${customer.dni || 'S/D'}
      `.trim();

      const newOrder = await tx.order.create({
        data: {
          receiptNumber: newReceiptNumber, // 👈 Guardamos el número oficial
          clientName: customer.name || 'Cliente Mostrador',
          clientPhone: customer.dni || '999999999',
          totalAmount: total,
          totalItems: totalItems,
          status: 'DELIVERED', 
          isPaid: true,        
          deliveryMethod: 'PICKUP',
          shippingAddress: customer.address || '',
          shippingCost: 0,
          notes: notes,
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // Descontar stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    revalidatePath('/admin/products');
    
    return { success: true, orderId: order.id, message: '¡Venta registrada con éxito!' };

  } catch (error) {
    console.error('Error procesando venta POS:', error);
    return { success: false, message: 'Error interno al procesar la venta.' };
  }
}