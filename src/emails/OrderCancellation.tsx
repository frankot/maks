import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Hr,
} from '@react-email/components';

const fontFamily = 'Inter, Helvetica, Arial, sans-serif';

const main = {
  backgroundColor: '#ffffff',
  fontFamily,
};

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 20px',
};

const heading = {
  fontSize: '24px',
  fontWeight: '400' as const,
  letterSpacing: '0.15em',
  textAlign: 'center' as const,
  margin: '0 0 32px',
  color: '#000000',
};

const subheading = {
  fontSize: '16px',
  fontWeight: '400' as const,
  textAlign: 'center' as const,
  color: '#333333',
  margin: '0 0 8px',
};

const body = {
  fontSize: '14px',
  color: '#333333',
  textAlign: 'center' as const,
  lineHeight: '1.6',
  margin: '0 0 8px',
};

const orderRef = {
  fontSize: '13px',
  color: '#666666',
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '32px 0',
};

const footer = {
  fontSize: '12px',
  color: '#999999',
  textAlign: 'center' as const,
  lineHeight: '1.6',
  margin: '0',
};

interface OrderCancellationProps {
  customerName: string;
  orderId: string;
}

export default function OrderCancellation({ customerName, orderId }: OrderCancellationProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>MAKS</Text>
          <Text style={subheading}>Your order has been cancelled</Text>
          <Text style={orderRef}>Order #{orderId.slice(0, 8).toUpperCase()}</Text>

          <Hr style={hr} />

          <Text style={body}>
            Hi {customerName},
          </Text>
          <Text style={body}>
            Your order has been cancelled. If you did not request this cancellation
            or have any questions, please don&apos;t hesitate to contact us.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you have any questions, reply to this email or contact us at hello@maks.jewelry
            <br />
            MAKS Jewelry
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
