import { ProductForm } from '../../_components/ProductForm';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-gray-600">Update product information</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ProductForm productId={id} />
      </div>
    </div>
  );
}
