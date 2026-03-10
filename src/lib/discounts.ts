import { prisma } from './prisma'
import type { DiscountCode, DiscountType } from '@prisma/client'
import { DEFAULT_PAGE_SIZE } from './constants'
import type { Currency } from '@/stores/currency-store'

export type { DiscountCode }

export async function getDiscountCodesPaginated(params: {
  page?: number
  pageSize?: number
}) {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    prisma.discountCode.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.discountCode.count(),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return { items, total, page, pageSize, totalPages }
}

export async function getDiscountCodeByCode(code: string): Promise<DiscountCode | null> {
  return prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  })
}

export async function validateDiscountCode(
  code: string,
  subtotal: number,
  currency: Currency = 'PLN'
): Promise<{
  valid: boolean
  error?: string
  discountType?: DiscountType
  discountValue?: number
  discountAmount?: number
}> {
  const discountCode = await getDiscountCodeByCode(code)

  if (!discountCode) {
    return { valid: false, error: 'Discount code not found' }
  }

  if (!discountCode.isActive) {
    return { valid: false, error: 'Discount code is no longer active' }
  }

  if (discountCode.isOneTime && discountCode.usedCount > 0) {
    return { valid: false, error: 'Discount code has already been used' }
  }

  const discountAmount = calculateDiscountAmount(
    discountCode.discountType,
    discountCode.discountValue,
    subtotal,
    currency,
    discountCode.discountValueEur ?? undefined
  )

  if (currency === 'EUR' && discountCode.discountType === 'FIXED_PLN' && !discountCode.discountValueEur) {
    return { valid: false, error: 'This discount code is not available for EUR purchases' }
  }

  return {
    valid: true,
    discountType: discountCode.discountType,
    discountValue: discountCode.discountValue,
    discountAmount,
  }
}

export function calculateDiscountAmount(
  discountType: DiscountType,
  discountValue: number,
  subtotal: number,
  currency: Currency = 'PLN',
  discountValueEur?: number
): number {
  let amount: number

  if (discountType === 'PERCENTAGE') {
    amount = Math.round((subtotal * discountValue) / 100)
  } else {
    // FIXED_PLN
    if (currency === 'EUR') {
      // Use EUR-specific value if available, otherwise return 0
      amount = discountValueEur ?? 0
    } else {
      amount = discountValue
    }
  }

  // Cap discount at the subtotal (can't go negative, minimum 1 subunit order)
  return Math.min(amount, subtotal - 1)
}

export async function createDiscountCode(data: {
  code: string
  discountType: DiscountType
  discountValue: number
  discountValueEur?: number
  isOneTime: boolean
}): Promise<DiscountCode> {
  return prisma.discountCode.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      discountValueEur: data.discountValueEur ?? null,
      isOneTime: data.isOneTime,
    },
  })
}

export async function updateDiscountCode(
  id: string,
  data: {
    code?: string
    discountType?: DiscountType
    discountValue?: number
    discountValueEur?: number | null
    isOneTime?: boolean
    isActive?: boolean
  }
): Promise<DiscountCode> {
  return prisma.discountCode.update({
    where: { id },
    data: {
      ...data,
      ...(data.code ? { code: data.code.toUpperCase() } : {}),
    },
  })
}

export async function deleteDiscountCode(id: string): Promise<void> {
  const code = await prisma.discountCode.findUnique({
    where: { id },
    include: { orders: { take: 1 } },
  })

  if (code && code.orders.length > 0) {
    throw new Error('Cannot delete a discount code that has been used in orders')
  }

  await prisma.discountCode.delete({ where: { id } })
}

export async function incrementUsedCount(id: string): Promise<void> {
  await prisma.discountCode.update({
    where: { id },
    data: { usedCount: { increment: 1 } },
  })
}
