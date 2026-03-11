'use server'

import { prisma } from '@/lib/prisma'

export async function deleteAllCustomers() {
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  const { count } = await prisma.user.deleteMany()
  return { count }
}

export async function deleteAllOrders() {
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  const { count } = await prisma.order.deleteMany()
  return { count }
}

export async function deleteAllProducts() {
  await prisma.featuredSectionProduct.deleteMany()
  await prisma.orderItem.deleteMany()
  const { count } = await prisma.product.deleteMany()
  return { count }
}

export async function deleteAllData() {
  await prisma.featuredSectionProduct.deleteMany()
  await prisma.featuredSection.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.discountCode.deleteMany()
  await prisma.galleryImage.deleteMany()
  await prisma.galleryRow.deleteMany()
  await prisma.photoArtist.deleteMany()
  await prisma.heroContent.deleteMany()
  await prisma.marqueeContent.deleteMany()
  await prisma.navCarouselContent.deleteMany()
  return { success: true }
}
