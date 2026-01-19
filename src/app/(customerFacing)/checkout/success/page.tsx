'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setIsLoading(false);
      return;
    }

    // Clear cart on successful payment
    clearCart();
    setIsLoading(false);
  }, [sessionId, clearCart]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-sm border border-gray-200 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/shop')}>
            Return to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-sm p-8 sm:p-12 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-600" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Thank you for your order. We&apos;ve received your payment and are processing your order.
          </p>
        </div>

        {sessionId && (
          <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Order Reference</p>
            <p className="font-mono text-sm font-medium">{sessionId}</p>
          </div>
        )}

        <div className="space-y-3 text-sm text-gray-600 pt-4">
          <p>
            You will receive a confirmation email with your order details shortly.
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="min-w-[150px]"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => router.push('/shop')}
            className="min-w-[150px]"
          >
            Continue Shopping
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
          <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
