"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DetailsModal } from "@/app/admin/components/DetailsModal";
import {
  formatPrice,
  formatPriceEur,
  getAvailabilityBadgeVariant,
  getAvailabilityLabel,
} from "@/lib/products";
import type { Product } from "@/app/generated/prisma";
import {
  Package,
  DollarSign,
  Calendar,
  FileText,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface ProductDetailsModalProps {
  productId: string;
  onClose: () => void;
}

export function ProductDetailsModal({
  productId,
  onClose,
}: ProductDetailsModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch product");
        }

        const productData = await response.json();
        setProduct(productData);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch product details";
        setError(errorMessage);
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const title = product ? product.name : "Loading Product Details";

  return (
    <DetailsModal
      isOpen={true}
      onClose={onClose}
      title={title}
      loading={loading}
      error={error}
      size="full"
    >
      {product && (
        <>
          {/* Top Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-500 p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Price PLN</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatPrice(product.priceInGrosz)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-green-500 p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">
                    Price EUR
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatPriceEur(product.priceInCents)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-purple-500 p-3">
                  {product.isAvailable ? (
                    <ToggleRight className="h-6 w-6 text-white" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Status</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {getAvailabilityLabel(product.isAvailable)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - 3 Column Layout */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            {/* Column 1: Basic Information */}
            <div className="space-y-6">
              {/* Product Information */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center">
                  <Package className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Product Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Package className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ToggleRight className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge
                        variant={getAvailabilityBadgeVariant(
                          product.isAvailable,
                        )}
                        className="mt-1"
                      >
                        {getAvailabilityLabel(product.isAvailable)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FileText className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Product ID</p>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        {product.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center">
                  <DollarSign className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Pricing
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <DollarSign className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">PLN Price</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(product.priceInGrosz)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">EUR Price</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPriceEur(product.priceInCents)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Description */}
            <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center">
                <FileText className="mr-3 h-6 w-6 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Description
                </h3>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="leading-relaxed text-gray-700">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Column 3: Images & Timestamps */}
            <div className="space-y-6">
              {/* Images */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center">
                  <ImageIcon className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Images
                  </h3>
                  <span className="ml-auto text-sm text-gray-500">
                    {product.imagePaths.length} images
                  </span>
                </div>
                {product.imagePaths.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {product.imagePaths.map((path, index) => (
                      <div
                        key={index}
                        className="group relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-lg"
                        onClick={() => window.open(path, "_blank")}
                      >
                        <div className="relative h-32 w-full">
                          <Image
                            src={path}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-gray-500">No images uploaded</p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center">
                  <Calendar className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Timestamps
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {format(
                          new Date(product.createdAt),
                          "dd MMM yyyy, HH:mm",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {format(
                          new Date(product.updatedAt),
                          "dd MMM yyyy, HH:mm",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DetailsModal>
  );
}
