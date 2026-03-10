'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  deleteAllCustomers,
  deleteAllOrders,
  deleteAllProducts,
  deleteAllData,
} from '../_actions'

const CONFIRM_PHRASE = 'DELETE'

interface DangerAction {
  label: string
  description: string
  action: () => Promise<unknown>
}

const actions: DangerAction[] = [
  {
    label: 'Delete All Customers',
    description:
      'This will permanently delete all customers along with their addresses, orders, order items, and payments.',
    action: deleteAllCustomers,
  },
  {
    label: 'Delete All Orders',
    description:
      'This will permanently delete all orders along with their order items and payments.',
    action: deleteAllOrders,
  },
  {
    label: 'Delete All Products',
    description:
      'This will permanently delete all products along with their featured section entries and related order items.',
    action: deleteAllProducts,
  },
  {
    label: 'Delete Entire Database',
    description:
      'This will permanently delete ALL data from the database: customers, orders, products, collections, discounts, gallery, hero content, and everything else. This cannot be undone.',
    action: deleteAllData,
  },
]

export function DangerZone() {
  return (
    <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6">
      <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
      <p className="mt-1 text-sm text-red-600">
        These actions are irreversible. Use only for development and testing.
      </p>

      <div className="mt-6 space-y-4">
        {actions.map((item) => (
          <DangerActionRow key={item.label} {...item} />
        ))}
      </div>
    </div>
  )
}

function DangerActionRow({ label, description, action }: DangerAction) {
  const router = useRouter()
  const [confirmValue, setConfirmValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await action()
      router.refresh()
    } finally {
      setLoading(false)
      setConfirmValue('')
      setOpen(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-red-200 bg-white px-4 py-3">
      <div>
        <p className="font-medium text-red-700">{label}</p>
      </div>
      <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmValue('') }}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            {label}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">{description}</span>
              <span className="block font-semibold text-red-600">
                Type <code className="rounded bg-red-100 px-1.5 py-0.5 text-red-700">{CONFIRM_PHRASE}</code> to confirm.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            placeholder={`Type ${CONFIRM_PHRASE} to confirm`}
            className="border-red-300 focus-visible:ring-red-500"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmValue !== CONFIRM_PHRASE || loading}
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting…' : label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
