import { resend } from './resend';
import OrderConfirmation from '@/emails/OrderConfirmation';
import OrderCancellation from '@/emails/OrderCancellation';

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  currency: string;
  orderItems: {
    id: string;
    name: string;
    slug: string | null;
    imagePath: string | null;
    price: number;
  }[];
  subtotal: number;
  shippingCost: number;
  pricePaid: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
}

const fromAddress =
  process.env.RESEND_FROM_EMAIL || 'MAKS <onboarding@resend.dev>';

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: data.customerEmail,
      subject: `MAKS — Order Confirmation #${data.orderId.slice(0, 8).toUpperCase()}`,
      react: OrderConfirmation({ data }),
    });

    if (error) {
      console.error('Failed to send order confirmation email:', error);
      return;
    }

    console.log(`📧 Order confirmation email sent to ${data.customerEmail}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
}

export async function sendOrderCancellationEmail(
  email: string,
  name: string,
  orderId: string
) {
  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `MAKS — Order Cancelled #${orderId.slice(0, 8).toUpperCase()}`,
      react: OrderCancellation({ customerName: name, orderId }),
    });

    if (error) {
      console.error('Failed to send order cancellation email:', error);
      return;
    }

    console.log(`📧 Order cancellation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending order cancellation email:', error);
  }
}
