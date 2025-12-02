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
          <Heading style={h1}>¡Nuevo Pedido! 🎉</Heading>
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
              Total: S/ {totalAmount.toFixed(2)}
            </Text>
          </Section>

          <Section style={{ padding: '0 24px' }}>
            <Text style={h2}>Detalle de productos:</Text>
            {items.map((item, index) => (
              <Text key={index} style={itemText}>
                • {item.quantity}x {item.title}
              </Text>
            ))}
          </Section>

          <Section style={btnContainer}>
            <Button style={button} href={url}>
              Ver en el Panel Admin
            </Button>
          </Section>
          
          <Text style={footer}>
            Sistema FiestasYa - Notificación Automática
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// --- ESTILOS OPTIMIZADOS ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px', // Limitamos el ancho para que no se estire feo
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)' // Sombrita sutil
};

const h1 = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0', // Quitamos márgenes verticales excesivos
};

const h2 = {
  color: '#334155',
  fontSize: '16px',
  fontWeight: '600',
  marginTop: '20px',
  marginBottom: '10px',
};

const itemText = {
  color: '#334155',
  fontSize: '14px',
  margin: '4px 0',
};

const card = {
  padding: '24px',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  backgroundColor: '#f8fafc',
  margin: '0 24px', // Margen lateral seguro
  width: 'calc(100% - 48px)', // Asegura que respete el margen
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '16px 0',
};

const total = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#16a34a',
  margin: '0',
  textAlign: 'right' as const,
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#0f172a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '10px',
};