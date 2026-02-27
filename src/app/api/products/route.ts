import { NextRequest, NextResponse } from 'next/server'
import { createProduct } from '@/lib/products'
import { errorHandler } from '@/lib/errorHandler'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createProductSchema } from '@/lib/validators/product'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')

    if (featured === 'true') {
      const { getFeaturedProducts } = await import('@/lib/products')
      const products = await getFeaturedProducts()
      return NextResponse.json(products)
    } else {
      const { getShopProducts } = await import('@/lib/products')
      const products = await getShopProducts()
      return NextResponse.json(products)
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return errorHandler(error)
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const data = createProductSchema.parse(body)

    const product = await createProduct({
      ...data,
      materials: data.materials || null,
      imagePaths: data.imagePaths || [],
      imagePublicIds: data.imagePublicIds || [],
      isAvailable: data.isAvailable ?? true,
      collectionId: data.collectionId || null,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating product:', error)
    return errorHandler(error)
  }
}
