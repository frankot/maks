'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-sm p-8 sm:p-12 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            Order Confirmed
          </h1>
          <p className="text-gray-600 text-sm">
            Thank you for your order!
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Order Number</p>
          <p className="font-mono text-sm font-medium">{orderId}</p>
        </div>

        <div className="space-y-3 text-sm text-gray-600 pt-4">
          <p>
            We&apos;ve sent a confirmation email with your order details.
          </p>
          <p>
            You will receive a payment link shortly to complete your purchase via Stripe.
          </p>
        </div>

        <div className="pt-6 space-y-3">
          <Button
            onClick={() => router.push('/shop')}
            className="w-full bg-black text-white hover:bg-gray-900 h-12 uppercase tracking-wider text-sm font-medium"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full h-12 uppercase tracking-wider text-sm font-medium"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
