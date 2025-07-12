"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Eye, Edit, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { AdminTable, TableColumn } from "../../components/Table";
import { AdminDropdown, DropdownAction } from "../../components/Dropdown";
import { formatPrice, formatPriceEur } from "@/lib/products";
import { ProductDetailsModal } from "./ProductDetailsModal";
import {
  deleteProductAction,
  toggleProductAvailabilityAction,
} from "../actions";
import type { Product } from "@/app/generated/prisma";

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const handleViewDetails = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleCloseModal = () => {
    setSelectedProductId(null);
  };

  const handleEdit = (productId: string) => {
    router.push(`/admin/products/edit/${productId}`);
  };

  const handleToggleAvailability = async (
    productId: string,
    currentAvailability: boolean,
  ) => {
    const result = await toggleProductAvailabilityAction(
      productId,
      !currentAvailability,
    );
    if (!result.success) {
      console.error("Failed to toggle availability:", result.error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const result = await deleteProductAction(productId);
      if (!result.success) {
        console.error("Failed to delete product:", result.error);
      }
    }
  };

  const getProductActions = (product: Product): DropdownAction[] => [
    {
      label: "View Details",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: () => handleViewDetails(product.id),
    },
    {
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: () => handleEdit(product.id),
    },
    {
      label: product.isAvailable ? "Mark Unavailable" : "Mark Available",
      icon: product.isAvailable ? (
        <ToggleLeft className="mr-2 h-4 w-4" />
      ) : (
        <ToggleRight className="mr-2 h-4 w-4" />
      ),
      onClick: () => handleToggleAvailability(product.id, product.isAvailable),
    },
    {
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: () => handleDelete(product.id),
      variant: "destructive" as const,
      separator: true,
    },
  ];

  const columns: TableColumn<Product>[] = [
    {
      key: "name",
      label: "Product Name",
      render: (product) => <div className="font-medium">{product.name}</div>,
    },
    {
      key: "pricePln",
      label: "Price (PLN)",
      render: (product) => formatPrice(product.priceInGrosz),
    },
    {
      key: "priceEur",
      label: "Price (EUR)",
      render: (product) => formatPriceEur(product.priceInCents),
    },
    {
      key: "availability",
      label: "Available",
      render: (product) => (
        <Switch
          checked={product.isAvailable}
          onCheckedChange={(checked) =>
            handleToggleAvailability(product.id, !checked)
          }
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (product) => (
        <div className="max-w-xs truncate" title={product.description}>
          {product.description}
        </div>
      ),
    },
    {
      key: "created",
      label: "Created",
      render: (product) => format(new Date(product.createdAt), "dd/MM/yyyy"),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (product) => (
        <AdminDropdown actions={getProductActions(product)} />
      ),
    },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={products}
        emptyMessage="No products found"
        keyExtractor={(product) => product.id}
      />

      {selectedProductId && (
        <ProductDetailsModal
          productId={selectedProductId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
