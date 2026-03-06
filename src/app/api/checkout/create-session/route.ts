import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { checkoutSchema } from '@/lib/validators/order'
import { getDiscountCodeByCode, calculateDiscountAmount } from '@/lib/discounts'

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
      discountCode: discountCodeInput,
      currency,
    } = checkoutSchema.parse(body)

    const stripeCurrency = currency === 'EUR' ? 'eur' : 'pln'

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

    // Get the correct price based on currency
    const getPrice = (product: (typeof products)[0]) =>
      currency === 'EUR' ? product.priceInCents : product.priceInGrosz

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
          currency: stripeCurrency,
          unit_amount: getPrice(product),
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
          currency: stripeCurrency,
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

    // Validate and apply discount code (server-side — never trust client calculation)
    let discountCodeId: string | undefined
    let discountAmountInSubunit = 0

    if (discountCodeInput) {
      const discountCode = await getDiscountCodeByCode(discountCodeInput)

      if (!discountCode) {
        return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 })
      }

      if (!discountCode.isActive) {
        return NextResponse.json({ error: 'Discount code is no longer active' }, { status: 400 })
      }

      if (discountCode.isOneTime && discountCode.usedCount > 0) {
        return NextResponse.json({ error: 'Discount code has already been used' }, { status: 400 })
      }

      const subtotal = products.reduce((sum, p) => sum + getPrice(p), 0)
      discountAmountInSubunit = calculateDiscountAmount(
        discountCode.discountType,
        discountCode.discountValue,
        subtotal,
        currency,
        discountCode.discountValueEur ?? undefined
      )
      discountCodeId = discountCode.id

      // Add discount as a negative line item (Stripe shows it clearly on the receipt)
      if (discountAmountInSubunit > 0) {
        lineItems.push({
          price_data: {
            currency: stripeCurrency,
            unit_amount: -discountAmountInSubunit,
            product_data: {
              name: `Discount (${discountCode.code})`,
            },
          },
          quantity: 1,
        })
      }
    }

    // Store order data in metadata using DB prices
    const metadata: Record<string, string> = {
      email,
      phoneNumber,
      firstName,
      lastName,
      deliveryMethod,
      currency,
      street: deliveryMethod === 'paczkomat' ? `Paczkomat ${paczkomatPointId}` : street || '',
      city,
      postalCode,
      country,
      items: JSON.stringify(
        productIds.map((productId: string) => ({
          productId,
          priceInGrosz: productMap.get(productId)!.priceInGrosz,
          priceInCents: productMap.get(productId)!.priceInCents,
        }))
      ),
      ...(discountCodeId
        ? {
            discountCodeId,
            discountAmount: discountAmountInSubunit.toString(),
          }
        : {}),
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
