'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl rounded-sm border border-gray-200 bg-white p-8 sm:p-12">
        <div className="space-y-6 text-center">
          <XCircle className="mx-auto h-16 w-16 text-orange-500" strokeWidth={1.5} />

          <div>
            <h1 className="mb-2 text-3xl font-bold">Payment Cancelled</h1>
            <p className="text-gray-600">
              Your payment was cancelled. Your cart items are still saved.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-sm text-gray-600">
              You can return to checkout to complete your purchase, or continue shopping.
            </p>

            <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
              <Button
                onClick={() => router.push('/checkout')}
                variant="outline"
                className="min-w-[150px]"
              >
                Return to Checkout
              </Button>
              <Button onClick={() => router.push('/shop')} className="min-w-[150px]">
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
