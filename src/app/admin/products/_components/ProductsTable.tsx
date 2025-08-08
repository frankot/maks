"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Eye, Edit, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { AdminTable, TableColumn } from "../../components/Table";
import { AdminDropdown, DropdownAction } from "../../components/Dropdown";
import {
  formatPrice,
  formatPriceEur,
  type ProductWithOrderItems,
} from "@/lib/products";
import { ProductDetailsModal } from "./ProductDetailsModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import {
  deleteProductAction,
  toggleProductAvailabilityAction,
} from "../actions";

interface ProductsTableProps {
  products: ProductWithOrderItems[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] =
    useState<ProductWithOrderItems | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDeleteClick = (product: ProductWithOrderItems) => {
    setProductToDelete(product);
    setDeleteError(null); // Clear any previous errors
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteProductAction(productToDelete.id);
      if (result.success) {
        setDeleteModalOpen(false);
        setProductToDelete(null);
      } else {
        setDeleteError(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteError("An unexpected error occurred while deleting the product");
    } finally {
      setIsDeleting(false);
    }
  };

  const getProductActions = (
    product: ProductWithOrderItems,
  ): DropdownAction[] => {
    const hasBeenOrdered = product.orderItems.length > 0;

    return [
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
        onClick: () =>
          handleToggleAvailability(product.id, product.isAvailable),
      },
      {
        label: "Delete",
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        onClick: () => handleDeleteClick(product),
        variant: "destructive" as const,
        separator: true,
        disabled: hasBeenOrdered,
        disabledTooltip: hasBeenOrdered
          ? "Cannot delete product that has been ordered"
          : undefined,
      },
    ];
  };

  const columns: TableColumn<ProductWithOrderItems>[] = [
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
      key: "productStatus",
      label: "Status",
      render: (product) => {
        const getStatusColor = (status: string, isAvailable: boolean) => {
          if (status === "SHOP" && !isAvailable) {
            return "bg-gray-200 text-gray-500"; // Greyed out for unavailable shop items
          }
          const statusColors = {
            SHOP: "bg-green-100 text-green-800",
            ORDERED: "bg-yellow-100 text-yellow-800",
            SOLD: "bg-blue-200 text-gray-800",
          };
          return (
            statusColors[status as keyof typeof statusColors] ||
            "bg-gray-100 text-gray-800"
          );
        };

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(product.productStatus, product.isAvailable)}`}
          >
            {product.productStatus}
            {product.productStatus === "SHOP" && !product.isAvailable}
          </span>
        );
      },
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

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalOpen(false);
            setProductToDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.name || ""}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </>
  );
}
