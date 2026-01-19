'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-2xl w-full bg-white p-8 sm:p-12 rounded-sm border border-gray-200">
        <div className="text-center space-y-6">
          <XCircle className="w-16 h-16 text-orange-500 mx-auto" strokeWidth={1.5} />
          
          <div>
            <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-gray-600">
              Your payment was cancelled. Your cart items are still saved.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-sm text-gray-600">
              You can return to checkout to complete your purchase, or continue shopping.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={() => router.push('/checkout')}
                variant="outline"
                className="min-w-[150px]"
              >
                Return to Checkout
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
      </div>
    </div>
  );
}
