import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import prisma from "@/lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  // 1. Validar que sea un aviso de pago
  const body = await request.json().catch(() => null);
  
  // MercadoPago a veces manda un test de validación al crear el webhook
  if (body?.action === "test.created") {
    console.log("🟢 Webhook de prueba recibido correctamente");
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Solo nos interesan los eventos de 'payment'
  // (type: 'payment' suele venir en el query string o en el body dependiendo la versión)
  // Pero la data.id siempre viene en el body para notificaciones v1
  const paymentId = body?.data?.id;

  if (!paymentId) {
    // Si no hay ID, ignoramos (puede ser otro tipo de evento)
    return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
  }

  try {
    // 2. Consultar a MercadoPago el estado REAL de ese pago
    // (Nunca confíes solo en el body, pregunta a la API oficial)
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    console.log(`💰 Procesando pago ${paymentId}. Estado: ${paymentData.status}`);

    // 3. Si el pago está APROBADO, actualizamos la orden
    if (paymentData.status === 'approved') {
      
      // external_reference es el ID de nuestra orden (lo pusimos en payments.ts)
      const orderId = paymentData.external_reference;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            isPaid: true,
            status: 'PAID', // Cambiamos de PENDING a PAID
            updatedAt: new Date(),
            // Opcional: Podrías guardar el ID del pago real de MP
            // mercadoPagoId: String(paymentId) 
          },
        });
        console.log(`✅ Orden ${orderId} pagada exitosamente.`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Error en Webhook:", error);
    // Retornamos 500 para que MP sepa que falló y reintente más tarde
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}