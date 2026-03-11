'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Eye, Edit, ToggleLeft, ToggleRight, Trash2, Package } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { AdminTable, TableColumn } from '../../../components/Table'
import { AdminDropdown, DropdownAction } from '../../../components/Dropdown'
import { formatPrice } from '@/lib/utils/products'
import type { ProductWithOrderItems } from '@/lib/products'
import { ProductDetailsModal } from './ProductDetailsModal'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import {
  deleteProductAction,
  toggleProductAvailabilityAction,
  updateProductStatusAction,
} from '../actions'

interface ProductsTableProps {
  products: ProductWithOrderItems[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ProductWithOrderItems | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleViewDetails = (productId: string) => {
    setSelectedProductId(productId)
  }

  const handleCloseModal = () => {
    setSelectedProductId(null)
  }

  const handleEdit = (productId: string) => {
    router.push(`/admin/products/edit/${productId}`)
  }

  const handleToggleAvailability = async (productId: string, currentAvailability: boolean) => {
    const result = await toggleProductAvailabilityAction({
      productId,
      isAvailable: !currentAvailability,
    })
    if (result?.serverError) {
      console.error('Failed to toggle availability:', result.serverError)
    }
  }

  const handleStatusChange = async (productId: string, newStatus: 'SHOP' | 'ORDERED' | 'SOLD') => {
    const result = await updateProductStatusAction({ productId, productStatus: newStatus })
    if (result?.serverError) {
      console.error('Failed to update status:', result.serverError)
    }
  }

  const handleDeleteClick = (product: ProductWithOrderItems) => {
    setProductToDelete(product)
    setDeleteError(null) // Clear any previous errors
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const result = await deleteProductAction({ productId: productToDelete.id })
      if (result?.data?.success) {
        setDeleteModalOpen(false)
        setProductToDelete(null)
      } else {
        setDeleteError(result?.serverError || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      setDeleteError('An unexpected error occurred while deleting the product')
    } finally {
      setIsDeleting(false)
    }
  }

  const getProductActions = (product: ProductWithOrderItems): DropdownAction[] => {
    const hasBeenOrdered = product.orderItems.length > 0

    const baseActions: DropdownAction[] = [
      {
        label: 'View Details',
        icon: <Eye className="mr-2 h-4 w-4" />,
        onClick: () => handleViewDetails(product.id),
      },
      {
        label: 'Edit',
        icon: <Edit className="mr-2 h-4 w-4" />,
        onClick: () => handleEdit(product.id),
      },
      {
        label: product.isAvailable ? 'Mark Unavailable' : 'Mark Available',
        icon: product.isAvailable ? (
          <ToggleLeft className="mr-2 h-4 w-4" />
        ) : (
          <ToggleRight className="mr-2 h-4 w-4" />
        ),
        onClick: () => handleToggleAvailability(product.id, product.isAvailable),
        disabled: product.productStatus === 'ORDERED' || product.productStatus === 'SOLD',
        disabledTooltip:
          product.productStatus === 'ORDERED' || product.productStatus === 'SOLD'
            ? 'Cannot change availability of ordered/sold products'
            : undefined,
        separator: true,
      },
    ]

    // Add status change options
    const statusActions: DropdownAction[] = []

    if (product.productStatus !== 'SHOP') {
      statusActions.push({
        label: 'Mark as Shop',
        icon: <Package className="mr-2 h-4 w-4" />,
        onClick: () => handleStatusChange(product.id, 'SHOP'),
      })
    }

    if (product.productStatus !== 'ORDERED') {
      statusActions.push({
        label: 'Mark as Ordered',
        icon: <Package className="mr-2 h-4 w-4" />,
        onClick: () => handleStatusChange(product.id, 'ORDERED'),
      })
    }

    if (product.productStatus !== 'SOLD') {
      statusActions.push({
        label: 'Mark as Sold',
        icon: <Package className="mr-2 h-4 w-4" />,
        onClick: () => handleStatusChange(product.id, 'SOLD'),
      })
    }

    const deleteAction: DropdownAction = {
      label: 'Delete',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: () => handleDeleteClick(product),
      variant: 'destructive' as const,
      separator: true,
      disabled: hasBeenOrdered,
      disabledTooltip: hasBeenOrdered ? 'Cannot delete product that has been ordered' : undefined,
    }

    return [...baseActions, ...statusActions, deleteAction]
  }

  const columns: TableColumn<ProductWithOrderItems>[] = [
    {
      key: 'name',
      label: 'Product Name',
      sortValue: (product) => product.name,
      render: (product) => (
        <div className="group relative">
          <div className="cursor-pointer font-medium">{product.name}</div>
          {/* Hover image preview */}
          {product.imagePaths && product.imagePaths[0] && (
            <div className="absolute top-full left-0 z-50 hidden pt-2 group-hover:block">
              <div className="relative h-32 w-32 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                <Image
                  src={product.imagePaths[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortValue: (product) => product.category,
      render: (product) => (
        <span className="rounded-md border px-2 py-0.5 text-xs tracking-wide uppercase">
          {product.category}
        </span>
      ),
    },
    {
      key: 'pricePln',
      label: 'Price (PLN)',
      sortValue: (product) => product.priceInGrosz,
      render: (product) => formatPrice(product.priceInGrosz),
    },
    {
      key: 'collection',
      label: 'Collection',
      sortValue: (product) => {
        type ProductWithCollection = ProductWithOrderItems & {
          collection?: { name?: string | null }
        }
        const p = product as ProductWithCollection
        return p.collection?.name ?? ''
      },
      render: (product) => {
        type ProductWithCollection = ProductWithOrderItems & {
          collection?: { name?: string | null }
        }
        const p = product as ProductWithCollection
        const collectionName = p.collection?.name
        return collectionName ? (
          <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
            {collectionName}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )
      },
    },
    {
      key: 'availability',
      label: 'Available',
      render: (product) => (
        <Switch
          checked={product.isAvailable}
          disabled={product.productStatus === 'ORDERED' || product.productStatus === 'SOLD'}
          onCheckedChange={(checked) => handleToggleAvailability(product.id, !checked)}
        />
      ),
    },
    {
      key: 'productStatus',
      label: 'Status',
      sortValue: (product) => product.productStatus,
      render: (product) => {
        const getStatusColor = (status: string, isAvailable: boolean) => {
          if (status === 'SHOP' && !isAvailable) {
            return 'bg-gray-200 text-gray-500' // Greyed out for unavailable shop items
          }
          const statusColors = {
            SHOP: 'bg-green-100 text-green-800',
            ORDERED: 'bg-yellow-100 text-yellow-800',
            SOLD: 'bg-blue-200 text-gray-800',
          }
          return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(product.productStatus, product.isAvailable)}`}
          >
            {product.productStatus}
            {product.productStatus === 'SHOP' && !product.isAvailable}
          </span>
        )
      },
    },
    {
      key: 'created',
      label: 'Created',
      sortValue: (product) => new Date(product.createdAt),
      render: (product) => format(new Date(product.createdAt), 'dd/MM/yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (product) => <AdminDropdown actions={getProductActions(product)} />,
    },
  ]

  return (
    <>
      <AdminTable
        columns={columns}
        data={products}
        emptyMessage="No products found"
        keyExtractor={(product) => product.id}
      />

      {selectedProductId && (
        <ProductDetailsModal productId={selectedProductId} onClose={handleCloseModal} />
      )}

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalOpen(false)
            setProductToDelete(null)
            setDeleteError(null)
          }
        }}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.name || ''}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </>
  )
}
