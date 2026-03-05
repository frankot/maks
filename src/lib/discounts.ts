import { prisma } from './prisma'
import type { DiscountCode, DiscountType } from '@prisma/client'
import { DEFAULT_PAGE_SIZE } from './constants'

export type { DiscountCode }

export async function getDiscountCodesPaginated(params: {
  cursor?: string
  pageSize?: number
}) {
  const { cursor, pageSize = DEFAULT_PAGE_SIZE } = params

  const codes = await prisma.discountCode.findMany({
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
  })

  const hasMore = codes.length > pageSize
  const items = hasMore ? codes.slice(0, -1) : codes
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

  return { items, nextCursor, hasMore }
}

export async function getDiscountCodeByCode(code: string): Promise<DiscountCode | null> {
  return prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  })
}

export async function validateDiscountCode(
  code: string,
  subtotalInGrosz: number
): Promise<{
  valid: boolean
  error?: string
  discountType?: DiscountType
  discountValue?: number
  discountAmountInGrosz?: number
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

  const discountAmountInGrosz = calculateDiscountAmount(
    discountCode.discountType,
    discountCode.discountValue,
    subtotalInGrosz
  )

  return {
    valid: true,
    discountType: discountCode.discountType,
    discountValue: discountCode.discountValue,
    discountAmountInGrosz,
  }
}

export function calculateDiscountAmount(
  discountType: DiscountType,
  discountValue: number,
  subtotalInGrosz: number
): number {
  let amount: number

  if (discountType === 'PERCENTAGE') {
    amount = Math.round((subtotalInGrosz * discountValue) / 100)
  } else {
    // FIXED_PLN — discountValue is already in grosz
    amount = discountValue
  }

  // Cap discount at the subtotal (can't go negative, minimum 1 grosz order)
  return Math.min(amount, subtotalInGrosz - 1)
}

export async function createDiscountCode(data: {
  code: string
  discountType: DiscountType
  discountValue: number
  isOneTime: boolean
}): Promise<DiscountCode> {
  return prisma.discountCode.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
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
