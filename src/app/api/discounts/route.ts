import { NextRequest, NextResponse } from 'next/server'
import { createDiscountCode, updateDiscountCode } from '@/lib/discounts'
import { z } from 'zod'

const createSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: z.enum(['PERCENTAGE', 'FIXED_PLN']),
  discountValue: z.number().int().positive(),
  discountValueEur: z.number().int().min(0).optional(),
  isOneTime: z.boolean(),
})

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createSchema.parse(body)

    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
      return NextResponse.json({ error: 'Percentage cannot exceed 100' }, { status: 400 })
    }

    const code = await createDiscountCode(data)
    return NextResponse.json(code, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    // Prisma unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      return NextResponse.json({ error: 'A discount code with this name already exists' }, { status: 409 })
    }
    console.error('Error creating discount code:', error)
    return NextResponse.json({ error: 'Failed to create discount code' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = updateSchema.parse(body)

    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
      return NextResponse.json({ error: 'Percentage cannot exceed 100' }, { status: 400 })
    }

    const code = await updateDiscountCode(id, data)
    return NextResponse.json(code)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      return NextResponse.json({ error: 'A discount code with this name already exists' }, { status: 409 })
    }
    console.error('Error updating discount code:', error)
    return NextResponse.json({ error: 'Failed to update discount code' }, { status: 500 })
  }
}
