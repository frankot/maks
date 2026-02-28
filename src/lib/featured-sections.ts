import { prisma } from './prisma'
import type { FeaturedSection, FeaturedSectionProduct, Product } from '@prisma/client'

export type FeaturedSectionWithProducts = FeaturedSection & {
  items: (FeaturedSectionProduct & { product: Product })[]
}

export async function getFeaturedSection(
  slot: number
): Promise<FeaturedSectionWithProducts | null> {
  try {
    return await prisma.featuredSection.findUnique({
      where: { slot },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: { product: true },
        },
      },
    })
  } catch (error) {
    console.error(`Error fetching featured section ${slot}:`, error)
    return null
  }
}

export async function upsertFeaturedSection(
  slot: number,
  data: { title: string; href: string; productIds: string[] }
): Promise<FeaturedSectionWithProducts> {
  return await prisma.$transaction(async (tx) => {
    const section = await tx.featuredSection.upsert({
      where: { slot },
      create: { slot, title: data.title, href: data.href },
      update: { title: data.title, href: data.href },
    })

    await tx.featuredSectionProduct.deleteMany({ where: { sectionId: section.id } })

    if (data.productIds.length > 0) {
      await tx.featuredSectionProduct.createMany({
        data: data.productIds.map((productId, index) => ({
          sectionId: section.id,
          productId,
          order: index,
        })),
      })
    }

    return await tx.featuredSection.findUniqueOrThrow({
      where: { id: section.id },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: { product: true },
        },
      },
    })
  })
}

export async function deleteFeaturedSection(slot: number): Promise<void> {
  try {
    await prisma.featuredSection.delete({ where: { slot } })
  } catch (error: unknown) {
    // Swallow P2025 (record not found) — idempotent delete
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return
    }
    throw error
  }
}
