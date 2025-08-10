import { ProductForm } from "../_components/ProductForm";

export default function AddProductPage() {
  return (
    <div className="space-y-6 max-w-5xl mt-16 pt-6 mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-gray-600">Create a new product in your catalog</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ProductForm />
      </div>
    </div>
  );
}
