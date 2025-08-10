import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "./ProductCard";

import React from "react";

export default async function FeaturedProducts() {
  try {
    const products = await getFeaturedProducts();
    if (products.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">No featured products found.</div>
      );
    }
    return (
      <section className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  } catch {
    return (
      <div className="text-center text-red-500 py-8">Error loading featured products. Please try again later.</div>
    );
  }
}
