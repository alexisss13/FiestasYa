'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';
import { Resend } from 'resend';
import { OrderEmail } from '@/components/email/OrderEmail';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

const orderSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(9),
  total: z.number().min(0),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number(),
  })),
  // Validamos opcionalmente los campos de envío si vienen
  deliveryMethod: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingCost: z.number().optional(),
});

interface CreateOrderInput {
  name: string;
  phone: string;
  total: number;
  items: { productId: string; quantity: number; price: number }[];
  // Campos opcionales para la acción (aunque el form los manda)
  deliveryMethod?: string;
  shippingAddress?: string;
  shippingCost?: number;
}

export async function createOrder(data: CreateOrderInput) {
  try {
    const validation = orderSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: 'Datos inválidos', errors: validation.error.flatten().fieldErrors };
    }

    const productIds = data.items.map((item) => item.productId);

    // 1. Validar existencia y STOCK disponible
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
    });

    if (dbProducts.length !== productIds.length) {
      return { success: false, message: 'Algunos productos ya no están disponibles' };
    }

    // Verificar que haya suficiente stock para cada item
    for (const item of data.items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return { 
          success: false, 
          message: `Stock insuficiente para ${product?.title}. Solo quedan ${product?.stock}.` 
        };
      }
    }

    // 2. TRANSACCIÓN ATÓMICA (Crear Orden + Restar Stock)
    const order = await prisma.$transaction(async (tx) => {
      // A. Crear la orden
      const newOrder = await tx.order.create({
        data: {
          clientName: data.name,
          clientPhone: data.phone,
          totalAmount: data.total,
          totalItems: data.items.reduce((acc, item) => acc + item.quantity, 0),
          status: 'PENDING',
          isPaid: false,
          deliveryMethod: data.deliveryMethod || 'PICKUP',
          shippingAddress: data.shippingAddress || '',
          shippingCost: data.shippingCost || 0,
          orderItems: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // Descontar stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // Lo hacemos después de la transacción para no bloquear la venta si falla el email
    try {
      if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
        // Obtenemos los nombres de los productos para el correo
        // (Como 'data.items' solo tiene IDs, usamos los que buscamos en 'dbProducts' al inicio)
        const emailItems = data.items.map(item => {
            const product = dbProducts.find(p => p.id === item.productId);
            return { title: product?.title || 'Producto', quantity: item.quantity };
        });

        await resend.emails.send({
          from: 'FiestasYa <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: `Nuevo Pedido #${order.id.split('-')[0].toUpperCase()} - ${data.name}`,
          react: OrderEmail({
            orderId: order.id,
            customerName: data.name,
            customerPhone: data.phone,
            totalAmount: data.total,
            items: emailItems,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://fiestasya.vercel.app'}/admin/orders/${order.id}`,
            deliveryMethod: data.deliveryMethod || 'PICKUP',
            shippingAddress: data.shippingAddress,
            shippingCost: data.shippingCost || 0
          }) as React.ReactElement,
        });
        console.log('📧 Notificación enviada al admin');
      }
    } catch (emailError) {
      console.error('Error enviando notificación:', emailError);
      // No lanzamos error para no interrumpir el flujo del usuario
    }

    return { success: true, orderId: order.id };
    
  } catch (error) {
    console.error('Error al crear la orden:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

// OBTENER ÓRDENES (SERIALIZADO)
export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: { include: { product: true } }
      }
    });

    const safeOrders = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      shippingCost: Number(order.shippingCost), 
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price),
        }
      }))
    }));

    return { success: true, data: safeOrders };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al obtener ordenes' };
  }
}


// Obtener un pedido por ID (Detalle Admin)
export async function getOrderById(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) return null;

    return { success: true, order };
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Actualizar Estado y Pago (Admin)
export async function updateOrderStatus(id: string, newStatus: OrderStatus, isPaid: boolean) {
  try {
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } } }, // Necesitamos el producto para ver el stock actual
    });

    if (!currentOrder) return { success: false, message: 'Orden no encontrada' };

    // 1. CASO: CANCELAR (Devolver Stock)
    // Si estaba activa y la cancelamos -> Sumamos stock
    if (newStatus === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        for (const item of currentOrder.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id },
          data: { status: newStatus, isPaid },
        });
      });
    }
    
    // 2. CASO: REACTIVAR (Volver a restar Stock)
    // Si estaba cancelada y la pasamos a Pendiente/Pagado -> Restamos stock
    else if (currentOrder.status === 'CANCELLED' && newStatus !== 'CANCELLED') {
      
      // ⚠️ PRIMERO: Verificar si AÚN hay stock disponible
      for (const item of currentOrder.orderItems) {
        // Consultamos el stock fresco de la BD
        const currentProduct = await prisma.product.findUnique({ where: { id: item.productId } });
        
        if (!currentProduct || currentProduct.stock < item.quantity) {
          return { 
            success: false, 
            message: `No se puede reactivar: No hay suficiente stock de "${item.product.title}".` 
          };
        }
      }

      // Si hay stock, procedemos a restar y cambiar estado
      await prisma.$transaction(async (tx) => {
        for (const item of currentOrder.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id },
          data: { status: newStatus, isPaid },
        });
      });
    } 
    
    // 3. CAMBIO NORMAL (Ej: Pendiente -> Entregado)
    // No toca inventario
    else {
      await prisma.order.update({
        where: { id },
        data: { status: newStatus, isPaid },
      });
    }

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/products');

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al actualizar la orden' };
  }
}