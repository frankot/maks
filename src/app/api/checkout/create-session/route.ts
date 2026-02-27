import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { STRIPE_CURRENCY } from '@/lib/constants'
import { checkoutSchema } from '@/lib/validators/order'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
    } = checkoutSchema.parse(body)

    // Extract product IDs from cart items
    const productIds = items.map((item: { productId: string }) => item.productId)

    // Fetch products from DB — only SHOP status products are purchasable
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, productStatus: 'SHOP' },
    })

    // Verify all requested products exist and are available
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id))
      const missingIds = productIds.filter((id: string) => !foundIds.has(id))
      return NextResponse.json(
        { error: `Products not available: ${missingIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Build a lookup map for DB products
    const productMap = new Map(products.map((p) => [p.id, p]))

    // Create line items for Stripe using DB-sourced data (quantity is always 1 for unique products)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = products.map((product) => {
      const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
        name: product.name,
      }

      if (product.description && product.description.trim()) {
        productData.description = product.description
      }

      if (product.imagePaths.length > 0) {
        productData.images = [product.imagePaths[0]]
      }

      return {
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: product.priceInGrosz,
          product_data: productData,
        },
        quantity: 1,
      }
    })

    // Calculate shipping cost (you can customize this)
    const shippingCost = 0 // Free shipping for now

    // Add shipping as a line item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: shippingCost,
          product_data: {
            name: 'Shipping',
            description:
              deliveryMethod === 'paczkomat' ? 'Paczkomat delivery' : 'Standard delivery',
          },
        },
        quantity: 1,
      })
    }

    // Store order data in metadata using DB prices
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
      items: JSON.stringify(
        productIds.map((productId: string) => ({
          productId,
          priceInGrosz: productMap.get(productId)!.priceInGrosz,
        }))
      ),
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
