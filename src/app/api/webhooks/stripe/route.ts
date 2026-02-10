import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Only process if payment was successful
        if (session.payment_status === 'paid') {
          await handleCheckoutSessionCompleted(session);
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handlePaymentFailed(session);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('🎉 Handling checkout session completed:', session.id);

    const metadata = session.metadata;

    if (!metadata) {
      console.error('❌ No metadata found in session');
      return;
    }

    console.log('📦 Processing order with metadata:', metadata);

    // Check if order already exists for this session (prevent duplicates)
    const existingPayment = await prisma.payment.findFirst({
      where: {
        transactionId: session.id,
      },
    });

    if (existingPayment) {
      console.log(`⚠️ Order already processed for session ${session.id}, skipping...`);
      return;
    }

    // Extract customer and order data from metadata
    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      street,
      city,
      postalCode,
      country,
      items: itemsJson,
    } = metadata;

    const items = JSON.parse(itemsJson);

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create or find user
      let user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            phoneNumber,
            firstName,
            lastName,
            password: null, // Guest checkout
          },
        });
      }

      // 2. Create addresses
      const billingAddress = await tx.address.create({
        data: {
          userId: user.id,
          street,
          city,
          postalCode,
          country,
          addressType: 'BILLING',
        },
      });

      const shippingAddress = await tx.address.create({
        data: {
          userId: user.id,
          street,
          city,
          postalCode,
          country,
          addressType: 'SHIPPING',
        },
      });

      // 3. Calculate totals (amount_total is in cents)
      const pricePaid = session.amount_total || 0;
      const shippingCost = 0; // Update if you have shipping cost in line items
      const subtotal = pricePaid - shippingCost;

      // 4. Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.PROCESSING, // Set to PROCESSING since payment is completed
          paymentMethod: PaymentMethod.STRIPE,
          pricePaid,
          subtotal,
          shippingCost,
          billingAddressId: billingAddress.id,
          shippingAddressId: shippingAddress.id,
        },
      });

      // 5. Create order items and mark products as ORDERED
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            priceInGrosz: item.priceInGrosz,
            currency: 'PLN',
          },
        });

        // Mark product as ORDERED and unavailable to hide it from the store
        await tx.product.update({
          where: { id: item.productId },
          data: {
            productStatus: 'ORDERED',
            isAvailable: false,
          },
        });
      }

      // 6. Create completed payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          userId: user.id,
          amount: pricePaid,
          currency: session.currency?.toUpperCase() || 'PLN',
          status: PaymentStatus.COMPLETED,
          paymentMethodType: PaymentMethod.STRIPE,
          transactionId: session.id, // Store Stripe session ID
        },
      });

      return newOrder;
    });

    console.log(`✅ Order ${order.id} created successfully for session ${session.id}`);

    // Send order confirmation email (outside transaction — never affects webhook response)
    try {
      const { getOrderById } = await import('@/lib/orders');
      const { sendOrderConfirmationEmail } = await import('@/lib/email');
      const fullOrder = await getOrderById(order.id);

      if (fullOrder && fullOrder.user) {
        const emailData = {
          orderId: fullOrder.id,
          customerName: `${fullOrder.user.firstName || ''} ${fullOrder.user.lastName || ''}`.trim(),
          customerEmail: fullOrder.user.email,
          currency: session.currency?.toUpperCase() || 'PLN',
          orderItems: fullOrder.orderItems.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug ?? null,
            imagePath: item.product.imagePaths?.[0] ?? null,
            price: item.priceInGrosz,
          })),
          subtotal: fullOrder.subtotal,
          shippingCost: fullOrder.shippingCost,
          pricePaid: fullOrder.pricePaid,
          shippingAddress: fullOrder.shippingAddress
            ? {
                street: fullOrder.shippingAddress.street,
                city: fullOrder.shippingAddress.city,
                postalCode: fullOrder.shippingAddress.postalCode,
                country: fullOrder.shippingAddress.country,
              }
            : null,
        };

        await sendOrderConfirmationEmail(emailData);
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send confirmation email (order still created):', emailError);
    }

    return order;
  } catch (error) {
    console.error('❌ Error handling checkout session completed:', error);
    throw error;
  }
}

async function handlePaymentFailed(session: Stripe.Checkout.Session) {
  try {
    console.log(`Payment failed for session ${session.id}`);

    // You can implement logic here to:
    // 1. Send email to customer about failed payment
    // 2. Log the failure for tracking
    // 3. Create a failed payment record if needed

    const metadata = session.metadata;
    if (metadata?.email) {
      console.log(`Notifying customer ${metadata.email} about failed payment`);
      // TODO: Send email notification
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}
