'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AdminTable, TableColumn } from '../../components/Table'
import { AdminDropdown, DropdownAction } from '../../components/Dropdown'
import { DiscountCodeForm } from './DiscountCodeForm'
import { toggleDiscountCodeAction, deleteDiscountCodeAction } from '../actions'
import type { DiscountCode } from '@prisma/client'

interface DiscountsTableProps {
  discountCodes: DiscountCode[]
}

function formatDiscountValue(code: DiscountCode): string {
  if (code.discountType === 'PERCENTAGE') {
    return `${code.discountValue}%`
  }
  return `${(code.discountValue / 100).toFixed(2)} zł`
}

export function DiscountsTable({ discountCodes }: DiscountsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<DiscountCode | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleToggle = async (id: string, currentActive: boolean) => {
    const result = await toggleDiscountCodeAction({ id, isActive: !currentActive })
    if (result?.serverError) {
      console.error('Failed to toggle discount code:', result.serverError)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const result = await deleteDiscountCodeAction({ id: deleteTarget.id })
      if (result?.data?.success) {
        setDeleteTarget(null)
      } else {
        setDeleteError(result?.serverError || 'Failed to delete discount code')
      }
    } catch {
      setDeleteError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const getActions = (code: DiscountCode): DropdownAction[] => {
    const hasBeenUsed = code.usedCount > 0

    return [
      {
        label: 'Edit',
        icon: <Edit className="mr-2 h-4 w-4" />,
        // Edit is handled via the form modal trigger in the render
        onClick: () => {
          // Trigger is handled by the DiscountCodeForm component
          const editButton = document.getElementById(`edit-discount-${code.id}`)
          editButton?.click()
        },
      },
      {
        label: 'Delete',
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        onClick: () => {
          setDeleteError(null)
          setDeleteTarget(code)
        },
        variant: 'destructive',
        separator: true,
        disabled: hasBeenUsed,
        disabledTooltip: hasBeenUsed
          ? 'Cannot delete a discount code that has been used in orders'
          : undefined,
      },
    ]
  }

  const columns: TableColumn<DiscountCode>[] = [
    {
      key: 'code',
      label: 'Code',
      sortValue: (code) => code.code,
      render: (code) => <span className="font-mono font-medium">{code.code}</span>,
    },
    {
      key: 'discount',
      label: 'Discount',
      sortValue: (code) => code.discountValue,
      render: (code) => (
        <span className="rounded-md border px-2 py-0.5 text-xs">
          {formatDiscountValue(code)}
        </span>
      ),
    },
    {
      key: 'usage',
      label: 'Usage',
      sortValue: (code) => code.usedCount,
      render: (code) => (
        <span className="text-sm">
          {code.isOneTime ? 'One-time' : 'Reusable'} ({code.usedCount} used)
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Active',
      render: (code) => (
        <Switch
          checked={code.isActive}
          onCheckedChange={() => handleToggle(code.id, code.isActive)}
        />
      ),
    },
    {
      key: 'created',
      label: 'Created',
      sortValue: (code) => new Date(code.createdAt),
      render: (code) => format(new Date(code.createdAt), 'dd/MM/yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (code) => (
        <div className="flex items-center justify-end gap-1">
          {/* Hidden edit trigger for the dropdown action */}
          <DiscountCodeForm
            editingCode={code}
            trigger={
              <button id={`edit-discount-${code.id}`} className="hidden">
                Edit
              </button>
            }
          />
          <AdminDropdown actions={getActions(code)} />
        </div>
      ),
    },
  ]

  return (
    <>
      <AdminTable
        columns={columns}
        data={discountCodes}
        emptyMessage="No discount codes found"
        keyExtractor={(code) => code.id}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discount Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.code}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
