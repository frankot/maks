import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      deliveryMethod,
      items,
      street,
      city,
      postalCode,
      country,
      paczkomatPointId,
    } = body;

    // Validate required fields
    if (!email || !phoneNumber || !firstName || !lastName || !deliveryMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate delivery-specific fields
    if (deliveryMethod === 'paczkomat' && !paczkomatPointId) {
      return NextResponse.json(
        { error: 'Paczkomat Point ID is required for Paczkomat delivery' },
        { status: 400 }
      );
    }

    if (deliveryMethod === 'address' && !street) {
      return NextResponse.json(
        { error: 'Street address is required for address delivery' },
        { status: 400 }
      );
    }

    if (!city || !postalCode || !country) {
      return NextResponse.json(
        { error: 'City, postal code, and country are required' },
        { status: 400 }
      );
    }

    interface CartItem {
      productId: string;
      name: string;
      priceInCents: number;
      description?: string;
      imagePath?: string;
    }

    // Create line items for Stripe (quantity is always 1 for unique products)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: CartItem) => {
      const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
        name: item.name,
      };

      // Only add description if it exists and is not empty
      if (item.description && item.description.trim()) {
        productData.description = item.description;
      }

      // Only add images if they exist
      if (item.imagePath) {
        productData.images = [item.imagePath];
      }

      return {
        price_data: {
          currency: 'pln',
          unit_amount: item.priceInCents,
          product_data: productData,
        },
        quantity: 1, // Always 1 for unique products
      };
    });

    // Calculate shipping cost (you can customize this)
    const shippingCost = 0; // Free shipping for now

    // Add shipping as a line item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'pln',
          unit_amount: shippingCost,
          product_data: {
            name: 'Shipping',
            description: deliveryMethod === 'paczkomat' ? 'Paczkomat delivery' : 'Standard delivery',
          },
        },
        quantity: 1,
      });
    }

    // Store order data in metadata (Stripe has a 500 character limit per metadata value)
    const metadata = {
      email,
      phoneNumber,
      firstName,
      lastName,
      deliveryMethod,
      street: deliveryMethod === 'paczkomat' ? `Paczkomat ${paczkomatPointId}` : street || '',
      city,
      postalCode,
      country,
      items: JSON.stringify(items.map((item: CartItem) => ({
        productId: item.productId,
        priceInCents: item.priceInCents,
      }))),
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      customer_email: email,
      metadata,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
