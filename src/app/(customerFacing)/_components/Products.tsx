"use client";

import React from "react";
import type { Product } from "@/app/generated/prisma";
import ProductCard from "./ProductCard";

interface ProductsProps {
  title: string;
  products: Product[];
}

export default function Products({ title, products }: ProductsProps) {
  if (!products?.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mx-auto px-4">
          <div className="py-6 md:py-8">
            <h2 className="font-extrabold text-4xl leading-[0.9] whitespace-nowrap text-black/90 uppercase sm:text-5xl md:text-6xl lg:text-7xl">
              {title}
            </h2>
          </div>
        </div>
        <div className="py-8 text-center text-gray-500">No products found.</div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      {/* Title */}
      <div className="mx-auto px-4">
        <div className="py-6 md:py-8">
          <h2 className="font-extrabold text-4xl leading-[0.9] whitespace-nowrap text-black/90 uppercase sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h2>
        </div>
      </div>

      {/* 4-column grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
