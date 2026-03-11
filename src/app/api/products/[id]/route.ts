import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct } from '@/lib/products'
import type { Category } from '@prisma/client'
import { errorHandler } from '@/lib/errorHandler'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const product = await getProductById(productId)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return errorHandler(error)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { id: productId } = await params
    const body = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const {
      slug,
      name,
      priceInGrosz,
      priceInCents,
      description,
      materials,
      sizes,
      imagePaths,
      imagePublicIds,
      isAvailable,
      category,
      collectionId,
    } = body as {
      slug?: string | null
      name?: string
      priceInGrosz?: number | string
      priceInCents?: number | string
      description?: string
      materials?: string | null
      sizes?: string[]
      imagePaths?: string[]
      imagePublicIds?: string[]
      isAvailable?: boolean
      category?: Category
      collectionId?: string | null
    }

    const priceG = priceInGrosz !== undefined ? Number(priceInGrosz) : undefined
    const priceC = priceInCents !== undefined ? Number(priceInCents) : undefined

    const sanitizedCategory = category ? (String(category).toUpperCase() as Category) : undefined

    const product = await updateProduct(productId, {
      ...(slug !== undefined && { slug: slug || undefined }),
      ...(name && { name }),
      ...(priceG !== undefined && Number.isFinite(priceG) && { priceInGrosz: priceG }),
      ...(priceC !== undefined && Number.isFinite(priceC) && { priceInCents: priceC }),
      ...(description && { description }),
      ...(materials !== undefined && { materials: materials || null }),
      ...(sizes !== undefined && { sizes }),
      ...(imagePaths && { imagePaths }),
      ...(imagePublicIds && { imagePublicIds }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(sanitizedCategory && { category: sanitizedCategory }),
      ...(collectionId !== undefined && { collectionId: collectionId || null }),
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return errorHandler(error)
  }
}
