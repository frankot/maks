import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import type { OrderEmailData } from '@/lib/email';

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

const orderRef = {
  fontSize: '13px',
  color: '#666666',
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const itemRow = {
  marginBottom: '16px',
};

const itemImage = {
  borderRadius: '4px',
};

const itemName = {
  fontSize: '14px',
  fontWeight: '500' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: '#000000',
  textDecoration: 'none',
  margin: '0 0 4px',
};

const itemPrice = {
  fontSize: '13px',
  color: '#666666',
  margin: '0',
};

const totalsSection = {
  marginTop: '24px',
};

const totalsRow = {
  fontSize: '13px',
  color: '#666666',
  textAlign: 'right' as const,
  margin: '0 0 4px',
};

const totalsFinal = {
  fontSize: '15px',
  fontWeight: '600' as const,
  color: '#000000',
  textAlign: 'right' as const,
  margin: '8px 0 0',
};

const sectionHeading = {
  fontSize: '12px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: '#999999',
  margin: '32px 0 8px',
};

const addressText = {
  fontSize: '14px',
  color: '#333333',
  lineHeight: '1.6',
  margin: '0',
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

function formatPrice(amountInSmallestUnit: number, currency: string): string {
  if (currency === 'EUR') {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(amountInSmallestUnit / 100);
  }
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amountInSmallestUnit / 100);
}

function getProductUrl(item: OrderEmailData['orderItems'][number]): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const path = item.slug || item.id;
  return `${baseUrl}/shop/${path}`;
}

function getThumbnailUrl(imagePath: string): string {
  if (imagePath.includes('res.cloudinary.com')) {
    return imagePath.replace('/upload/', '/upload/w_120,h_120,c_fill/');
  }
  return imagePath;
}

interface OrderConfirmationProps {
  data: OrderEmailData;
}

export default function OrderConfirmation({ data }: OrderConfirmationProps) {
  const currency = data.currency || 'PLN';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>MAKS</Text>
          <Text style={subheading}>Thank you for your order</Text>
          <Text style={orderRef}>Order #{data.orderId.slice(0, 8).toUpperCase()}</Text>

          <Hr style={hr} />

          <Section>
            {data.orderItems.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={{ width: '72px', verticalAlign: 'top' }}>
                  {item.imagePath && (
                    <Img
                      src={getThumbnailUrl(item.imagePath)}
                      width="60"
                      height="60"
                      alt={item.name}
                      style={itemImage}
                    />
                  )}
                </Column>
                <Column style={{ verticalAlign: 'top', paddingLeft: '12px' }}>
                  <Link href={getProductUrl(item)} style={itemName}>
                    {item.name}
                  </Link>
                  <Text style={itemPrice}>{formatPrice(item.price, currency)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          <Section style={totalsSection}>
            <Text style={totalsRow}>
              Subtotal: {formatPrice(data.subtotal, currency)}
            </Text>
            <Text style={totalsRow}>
              Shipping: {data.shippingCost === 0 ? 'Free' : formatPrice(data.shippingCost, currency)}
            </Text>
            <Text style={totalsFinal}>
              Total: {formatPrice(data.pricePaid, currency)}
            </Text>
          </Section>

          {data.shippingAddress && (
            <>
              <Text style={sectionHeading}>Shipping address</Text>
              <Text style={addressText}>
                {data.customerName}
                <br />
                {data.shippingAddress.street}
                <br />
                {data.shippingAddress.postalCode} {data.shippingAddress.city}
                <br />
                {data.shippingAddress.country}
              </Text>
            </>
          )}

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
