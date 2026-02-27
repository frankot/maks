import { ProductForm } from '../_components/ProductForm'

export default function AddProductPage() {
  return (
    <div className="mx-auto mt-16 max-w-5xl space-y-6 pt-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-gray-600">Create a new product in your catalog</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ProductForm />
      </div>
    </div>
  )
}
