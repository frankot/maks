import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import AdminPageWrapper from '../../../components/AdminPageWrapper'
import { ProductForm } from '../../_components/ProductForm'

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params

  return (
    <AdminPageWrapper>
      <div className="mx-auto max-w-5xl space-y-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-black"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to products
        </Link>
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-sm text-gray-500">Update product information.</p>
        </div>
      </div>

      <ProductForm productId={id} />
    </AdminPageWrapper>
  )
}
