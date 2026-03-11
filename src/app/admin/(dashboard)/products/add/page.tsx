import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import AdminPageWrapper from '../../../components/AdminPageWrapper'
import { ProductForm } from '../_components/ProductForm'

export default function AddProductPage() {
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
        <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold">Add Product</h1>
            <p className="text-sm text-gray-500">Create a new product in your catalog.</p>
          </div>
        </div>
      </div>

      <ProductForm />
    </AdminPageWrapper>
  )
}
