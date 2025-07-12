import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/products";
import { ProductsTable } from "./components/ProductsTable";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total: {products.length} products
          </div>
          <Button asChild>
            <Link href="/admin/products/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
