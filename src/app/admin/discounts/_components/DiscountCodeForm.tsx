'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { DiscountCode } from '@prisma/client'

interface DiscountCodeFormProps {
  editingCode?: DiscountCode
  trigger?: React.ReactNode
}

export function DiscountCodeForm({ editingCode, trigger }: DiscountCodeFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [code, setCode] = useState(editingCode?.code ?? '')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_PLN'>(
    editingCode?.discountType ?? 'PERCENTAGE'
  )
  const [discountValue, setDiscountValue] = useState(
    editingCode
      ? editingCode.discountType === 'FIXED_PLN'
        ? (editingCode.discountValue / 100).toString()
        : editingCode.discountValue.toString()
      : ''
  )
  const [isOneTime, setIsOneTime] = useState<'one-time' | 'reusable'>(
    editingCode?.isOneTime ? 'one-time' : 'reusable'
  )

  const resetForm = () => {
    if (!editingCode) {
      setCode('')
      setDiscountType('PERCENTAGE')
      setDiscountValue('')
      setIsOneTime('reusable')
    }
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const numericValue = parseFloat(discountValue)
      if (isNaN(numericValue) || numericValue <= 0) {
        throw new Error('Discount value must be a positive number')
      }

      if (discountType === 'PERCENTAGE' && numericValue > 100) {
        throw new Error('Percentage discount cannot exceed 100%')
      }

      // Convert PLN to grosz for FIXED_PLN
      const valueInGrosz =
        discountType === 'FIXED_PLN' ? Math.round(numericValue * 100) : numericValue

      const body = {
        code: code.toUpperCase(),
        discountType,
        discountValue: valueInGrosz,
        isOneTime: isOneTime === 'one-time',
        ...(editingCode ? { id: editingCode.id } : {}),
      }

      const response = await fetch('/api/discounts', {
        method: editingCode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save discount code')
      }

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Discount Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCode ? 'Edit Discount Code' : 'Add Discount Code'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., SUMMER20"
              required
              className="mt-1.5 uppercase"
            />
          </div>

          <div>
            <Label htmlFor="discountType">Discount Type</Label>
            <Select
              value={discountType}
              onValueChange={(v) => setDiscountType(v as 'PERCENTAGE' | 'FIXED_PLN')}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                <SelectItem value="FIXED_PLN">Fixed Amount (PLN)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="discountValue">
              Value {discountType === 'PERCENTAGE' ? '(%)' : '(zł)'}
            </Label>
            <Input
              id="discountValue"
              type="number"
              min={discountType === 'PERCENTAGE' ? '1' : '0.01'}
              step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
              max={discountType === 'PERCENTAGE' ? '100' : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 50.00'}
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="usageType">Usage Type</Label>
            <Select
              value={isOneTime}
              onValueChange={(v) => setIsOneTime(v as 'one-time' | 'reusable')}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reusable">Reusable</SelectItem>
                <SelectItem value="one-time">One-time use</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingCode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
