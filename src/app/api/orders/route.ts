import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentMethod } from '@prisma/client'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      deliveryMethod,
      items,
      totalPriceInCents,
      street,
      city,
      postalCode,
      country,
      paczkomatPointId,
    } = body

    // Validate required fields
    if (
      !email ||
      !phoneNumber ||
      !firstName ||
      !lastName ||
      !deliveryMethod ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate delivery-specific fields
    if (deliveryMethod === 'paczkomat' && !paczkomatPointId) {
      return NextResponse.json(
        { error: 'Paczkomat Point ID is required for Paczkomat delivery' },
        { status: 400 }
      )
    }

    if (deliveryMethod === 'address' && !street) {
      return NextResponse.json(
        { error: 'Street address is required for address delivery' },
        { status: 400 }
      )
    }

    if (!city || !postalCode || !country) {
      return NextResponse.json(
        { error: 'City, postal code, and country are required' },
        { status: 400 }
      )
    }

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create or find user
      let user = await tx.user.findUnique({
        where: { email },
      })

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            phoneNumber,
            firstName,
            lastName,
            password: null, // Guest checkout
          },
        })
      }

      // 2. Create addresses
      const billingAddressData = {
        userId: user.id,
        street: deliveryMethod === 'paczkomat' ? `Paczkomat ${paczkomatPointId}` : street,
        city,
        postalCode,
        country,
        addressType: 'BILLING' as const,
      }

      const shippingAddressData = {
        userId: user.id,
        street: deliveryMethod === 'paczkomat' ? `Paczkomat ${paczkomatPointId}` : street,
        city,
        postalCode,
        country,
        addressType: 'SHIPPING' as const,
      }

      const billingAddress = await tx.address.create({
        data: billingAddressData,
      })

      const shippingAddress = await tx.address.create({
        data: shippingAddressData,
      })

      // 3. Calculate totals
      const shippingCost = 0 // Free shipping for now
      const subtotal = totalPriceInCents
      const pricePaid = subtotal + shippingCost

      // 4. Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          paymentMethod: PaymentMethod.STRIPE,
          pricePaid,
          subtotal,
          shippingCost,
          billingAddressId: billingAddress.id,
          shippingAddressId: shippingAddress.id,
        },
      })

      // 5. Create order items
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            priceInGrosz: item.priceInCents,
            currency: 'PLN',
          },
        })
      }

      // 6. Create pending payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          userId: user.id,
          amount: pricePaid,
          currency: 'PLN',
          status: 'PENDING',
          paymentMethodType: PaymentMethod.STRIPE,
        },
      })

      return newOrder
    })

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        message: 'Order created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
