'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found')
      setIsLoading(false)
      return
    }

    // Clear cart on successful payment
    clearCart()
    setIsLoading(false)
  }, [sessionId, clearCart])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-gray-400" />
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-sm border border-gray-200 bg-white p-8 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={() => router.push('/shop')}>Return to Shop</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl space-y-6 rounded-sm bg-white p-8 text-center sm:p-12">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="mb-2 text-3xl font-bold">Payment Successful!</h1>
          <p className="text-gray-600">
            Thank you for your order. We&apos;ve received your payment and are processing your
            order.
          </p>
        </div>

        {sessionId && (
          <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
            <p className="mb-1 text-xs tracking-wide text-gray-500 uppercase">Order Reference</p>
            <p className="font-mono text-sm font-medium">{sessionId}</p>
          </div>
        )}

        <div className="space-y-3 pt-4 text-sm text-gray-600">
          <p>You will receive a confirmation email with your order details shortly.</p>
        </div>

        <div className="flex flex-col justify-center gap-3 pt-6 sm:flex-row">
          <Button onClick={() => router.push('/')} variant="outline" className="min-w-[150px]">
            Back to Home
          </Button>
          <Button onClick={() => router.push('/shop')} className="min-w-[150px]">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
