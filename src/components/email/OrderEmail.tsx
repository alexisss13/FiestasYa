import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Column,
  Row,
} from '@react-email/components';

interface OrderEmailProps {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  items: { title: string; quantity: number }[];
  url: string;
  deliveryMethod: string;
  shippingAddress?: string;
  shippingCost: number;
}

export const OrderEmail: React.FC<Readonly<OrderEmailProps>> = ({
  orderId,
  customerName,
  customerPhone,
  totalAmount,
  items,
  url,
  deliveryMethod,
  shippingAddress,
  shippingCost,
}) => {
  
  const getDeliveryLabel = (method: string) => {
    const labels: Record<string, string> = {
      'PICKUP': 'Recojo en Tienda',
      'DELIVERY': 'Delivery Local',
      'PROVINCE': 'Envío a Provincia (Agencia)'
    };
    return labels[method] || method;
  };

  const formattedOrderId = orderId.split('-')[0].toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>Nuevo pedido #{formattedOrderId} de {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Nuevo Pedido Recibido! 🎉</Heading>
          <Text style={text}>Hola Admin, tienes una nueva venta en FiestasYa.</Text>
          
          <Section style={card}>
            <Row>
              <Column>
                <Text style={paragraph}><strong>Pedido:</strong> #{formattedOrderId}</Text>
                <Text style={paragraph}><strong>Cliente:</strong> {customerName}</Text>
                <Text style={paragraph}><strong>Teléfono:</strong> {customerPhone}</Text>
              </Column>
            </Row>
            
            <Hr style={hr} />
            
            <Row>
              <Column>
                <Text style={paragraph}><strong>Entrega:</strong> {getDeliveryLabel(deliveryMethod)}</Text>
                {deliveryMethod === 'DELIVERY' && shippingAddress && (
                   <Text style={paragraph}><strong>Dirección:</strong> {shippingAddress}</Text>
                )}
                {shippingCost > 0 && (
                   <Text style={paragraph}><strong>Costo Envío:</strong> S/ {shippingCost.toFixed(2)}</Text>
                )}
              </Column>
            </Row>

            <Hr style={hr} />

            <Text style={total}>
              Total a Cobrar: S/ {totalAmount.toFixed(2)}
            </Text>
          </Section>

          <Section>
            <Text style={h2}>Detalle de productos:</Text>
            {items.map((item, index) => (
              <Text key={index} style={itemText}>
                • {item.quantity}x {item.title}
              </Text>
            ))}
          </Section>

          <Section style={btnContainer}>
            {/* 👇 ESTE COMPONENTE BUTTON ES CLAVE PARA QUE FUNCIONE EN GMAIL */}
            <Button style={button} href={url}>
              Ver en el Panel Admin
            </Button>
          </Section>
          
          <Text style={footer}>
            Este es un correo automático del sistema FiestasYa.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// --- ESTILOS INLINE (Necesarios para emails) ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  padding: '0 48px',
};

const h2 = {
  color: '#334155',
  fontSize: '18px',
  fontWeight: '600',
  padding: '0 48px',
  marginTop: '24px',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 48px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '20px',
  margin: '8px 0',
};

const itemText = {
  color: '#334155',
  fontSize: '14px',
  margin: '4px 0',
  padding: '0 48px',
};

const card = {
  padding: '24px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  backgroundColor: '#f8fafc',
  margin: '24px 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const total = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#16a34a',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#0f172a',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px 0', // Padding vertical, el ancho es 100%
  maxWidth: '250px',
  margin: '0 auto',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
};