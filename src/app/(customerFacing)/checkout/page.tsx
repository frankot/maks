'use client';

import { useCartStore } from '@/stores/cart-store';
import { formatCartPrice } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

type DeliveryMethod = 'paczkomat' | 'address';

export default function CheckoutPage() {
  const { items, totalPriceInCents } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('address');

  // Paczkomat fields
  const [paczkomatPointId, setPaczkomatPointId] = useState('');

  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Poland');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading state while hydrating
  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        </div>
      </div>
    );
  }

  // Redirect if cart is empty after hydration
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="space-y-4 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-gray-600">Add some items to your cart to checkout</p>
          <Button onClick={() => router.push('/shop')} className="mt-4">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Prepare checkout data for Stripe
      const checkoutData = {
        email,
        phoneNumber,
        firstName,
        lastName,
        deliveryMethod,
        items: items.map((item) => ({
          productId: item.productId,
          priceInCents: item.priceInCents,
          name: item.name,
          imagePath: item.imagePath || '',
        })),
        ...(deliveryMethod === 'paczkomat'
          ? { paczkomatPointId, city, postalCode, country }
          : { street, city, postalCode, country }),
      };

      // Create Stripe checkout session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
      setIsSubmitting(false);
    }
  };

  const shippingCost = 0; // Free shipping for now
  const total = totalPriceInCents() + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50 pt-[var(--nav-height)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Form */}
          <div className="order-2 lg:order-1">
            <div className="rounded-sm bg-white p-6 sm:p-8">
              <h1 className="mb-8 text-2xl font-bold tracking-tight uppercase">Checkout</h1>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h2 className="border-b pb-2 text-sm font-semibold tracking-wide uppercase">
                    Contact Information
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-xs tracking-wide uppercase">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-xs tracking-wide uppercase">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs tracking-wide uppercase">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs tracking-wide uppercase">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1"
                      placeholder="+48 123 456 789"
                    />
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="space-y-4">
                  <h2 className="border-b pb-2 text-sm font-semibold tracking-wide uppercase">
                    Delivery Method
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('address')}
                      className={`rounded-sm border p-4 text-left transition-all ${
                        deliveryMethod === 'address'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-sm font-medium">Delivery to Address</div>
                      <div className="mt-1 text-xs text-gray-500">Standard shipping</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('paczkomat')}
                      className={`rounded-sm border p-4 text-left transition-all ${
                        deliveryMethod === 'paczkomat'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-sm font-medium">DPD Paczkomat</div>
                      <div className="mt-1 text-xs text-gray-500">Pick up at locker</div>
                    </button>
                  </div>

                  {/* Paczkomat Fields */}
                  {deliveryMethod === 'paczkomat' && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <Label
                          htmlFor="paczkomatPointId"
                          className="text-xs tracking-wide uppercase"
                        >
                          Paczkomat Point ID *
                        </Label>
                        <Input
                          id="paczkomatPointId"
                          type="text"
                          required
                          value={paczkomatPointId}
                          onChange={(e) => setPaczkomatPointId(e.target.value)}
                          className="mt-1"
                          placeholder="e.g., KRA01M"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Find your nearest Paczkomat on the DPD website
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Address Fields */}
                  {deliveryMethod === 'address' && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <Label htmlFor="street" className="text-xs tracking-wide uppercase">
                          Street Address *
                        </Label>
                        <Input
                          id="street"
                          type="text"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="mt-1"
                          placeholder="Street name and number"
                        />
                      </div>
                    </div>
                  )}

                  {/* Common Address Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-xs tracking-wide uppercase">
                        City *
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="text-xs tracking-wide uppercase">
                        Postal Code *
                      </Label>
                      <Input
                        id="postalCode"
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="mt-1"
                        placeholder="00-000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-xs tracking-wide uppercase">
                      Country *
                    </Label>
                    <Input
                      id="country"
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <h2 className="border-b pb-2 text-sm font-semibold tracking-wide uppercase">
                    Payment
                  </h2>
                  <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      Payment will be processed securely via Stripe after placing your order.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="rounded-sm border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full bg-black text-sm font-medium tracking-wider text-white uppercase hover:bg-gray-900"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-[calc(var(--nav-height)+1rem)] rounded-sm bg-white p-6 sm:p-8">
              <h2 className="mb-6 text-lg font-bold tracking-tight uppercase">Order Summary</h2>

              {/* Cart Items */}
              <div className="mb-6 space-y-4 border-b pb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 bg-gray-100">
                      {item.imagePath ? (
                        <Image src={item.imagePath} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-300" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        {formatCartPrice(item.priceInCents)}
                      </p>
                    </div>

                    <div className="text-sm font-medium">{formatCartPrice(item.priceInCents)}</div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCartPrice(totalPriceInCents())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Free' : formatCartPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCartPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
