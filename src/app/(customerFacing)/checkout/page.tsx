'use client';

import { useCart } from '@/contexts/CartContext';
import { formatCartPrice } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import Nav from '../_components/Nav';

type DeliveryMethod = 'paczkomat' | 'address';

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Redirect if cart is empty
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-gray-600">Add some items to your cart to checkout</p>
          <Button
            onClick={() => router.push('/shop')}
            className="mt-4"
          >
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
        items: cart.items.map(item => ({
          productId: item.productId,
          priceInCents: item.priceInCents,
          name: item.name,
          imagePath: item.imagePath || '',
        })),
        ...(deliveryMethod === 'paczkomat' 
          ? { paczkomatPointId, city, postalCode, country }
          : { street, city, postalCode, country }
        ),
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
  const total = cart.totalPriceInCents + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav/>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 mt-[var(--nav-height)]  lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-white p-6 sm:p-8 rounded-sm">
              <h1 className="text-2xl font-bold uppercase tracking-tight mb-8">Checkout</h1>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide border-b pb-2">
                    Contact Information
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-xs uppercase tracking-wide">
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
                      <Label htmlFor="lastName" className="text-xs uppercase tracking-wide">
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
                    <Label htmlFor="email" className="text-xs uppercase tracking-wide">
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
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wide">
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
                  <h2 className="text-sm font-semibold uppercase tracking-wide border-b pb-2">
                    Delivery Method
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('address')}
                      className={`p-4 border rounded-sm text-left transition-all ${
                        deliveryMethod === 'address'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-sm font-medium">Delivery to Address</div>
                      <div className="text-xs text-gray-500 mt-1">Standard shipping</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('paczkomat')}
                      className={`p-4 border rounded-sm text-left transition-all ${
                        deliveryMethod === 'paczkomat'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-sm font-medium">DPD Paczkomat</div>
                      <div className="text-xs text-gray-500 mt-1">Pick up at locker</div>
                    </button>
                  </div>

                  {/* Paczkomat Fields */}
                  {deliveryMethod === 'paczkomat' && (
                    <div className="space-y-4 mt-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="paczkomatPointId" className="text-xs uppercase tracking-wide">
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
                        <p className="text-xs text-gray-500 mt-1">
                          Find your nearest Paczkomat on the DPD website
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Address Fields */}
                  {deliveryMethod === 'address' && (
                    <div className="space-y-4 mt-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="street" className="text-xs uppercase tracking-wide">
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
                      <Label htmlFor="city" className="text-xs uppercase tracking-wide">
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
                      <Label htmlFor="postalCode" className="text-xs uppercase tracking-wide">
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
                    <Label htmlFor="country" className="text-xs uppercase tracking-wide">
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
                  <h2 className="text-sm font-semibold uppercase tracking-wide border-b pb-2">
                    Payment
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
                    <p className="text-sm text-gray-600">
                      Payment will be processed securely via Stripe after placing your order.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-black text-white hover:bg-gray-900 uppercase tracking-wider text-sm font-medium"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-1 lg:order-2">
            <div className="bg-white p-6 sm:p-8 rounded-sm sticky top-[calc(var(--nav-height)+1rem)]">
              <h2 className="text-lg font-bold uppercase tracking-tight mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 pb-6 border-b">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100">
                      {item.imagePath ? (
                        <Image
                          src={item.imagePath}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatCartPrice(item.priceInCents)}
                      </p>
                    </div>

                    <div className="text-sm font-medium">
                      {formatCartPrice(item.priceInCents)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCartPrice(cart.totalPriceInCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Free' : formatCartPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t text-base font-bold">
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
