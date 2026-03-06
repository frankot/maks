import { NextRequest, NextResponse } from 'next/server'
import { validateDiscountCode } from '@/lib/discounts'
import { z } from 'zod'

const validateSchema = z.object({
  code: z.string().min(1),
  subtotalInGrosz: z.number().int().positive(),
  currency: z.enum(['PLN', 'EUR']).default('PLN'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotalInGrosz, currency } = validateSchema.parse(body)

    const result = await validateDiscountCode(code, subtotalInGrosz, currency)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Error validating discount code:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate discount code' },
      { status: 500 }
    )
  }
}
