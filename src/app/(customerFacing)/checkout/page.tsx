'use client'

import { useCartStore } from '@/stores/cart-store'
import { formatCartPrice } from '@/lib/cart'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'

type DeliveryMethod = 'paczkomat' | 'address'

export default function CheckoutPage() {
  const { items, totalPriceInCents } = useCartStore()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('address')

  // Paczkomat fields
  const [paczkomatPointId, setPaczkomatPointId] = useState('')

  // Address fields
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Poland')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show loading state while hydrating
  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
      </div>
    )
  }

  // Redirect if cart is empty after hydration
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <ShoppingBag className="h-12 w-12 text-black/20" strokeWidth={1} />
        <h1 className="mt-6 text-lg font-semibold tracking-wider uppercase">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-black/50">
          Add some items to your cart to checkout
        </p>
        <button
          onClick={() => router.push('/shop')}
          className="mt-8 border border-black px-8 py-3 text-xs font-medium tracking-widest uppercase transition-colors hover:bg-black hover:text-white"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
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
      }

      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during checkout')
      setIsSubmitting(false)
    }
  }

  const shippingCost = 0
  const total = totalPriceInCents() + shippingCost

  return (
    <>
      {/* Hero + Sticky Bar — consistent with shop/gallery/about */}
      {/* <PageWithHeroBar imagePath="/checkout.webp" imageAlt="Checkout">
        <span className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors">
          CHECKOUT
        </span>
        <div className="mx-2 h-4 w-px bg-gray-300" />
        <span className="text-xs font-light tracking-[0.3em] whitespace-nowrap text-black">
          mami
        </span>
      </PageWithHeroBar> */}

      {/* Main Content */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
            {/* Left Column — Form */}
            <div className="order-2 lg:order-1 lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Contact Information */}
                <section>
                  <h2 className="text-xs font-semibold tracking-widest text-black/80 uppercase">
                    Contact
                  </h2>
                  <div className="mt-1 h-px w-full bg-black/10" />

                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
                    <div>
                      <Label htmlFor="firstName" className="text-[11px] tracking-wider text-black/50 uppercase">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1.5 rounded-none border-black/15 bg-transparent focus-visible:ring-black/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-[11px] tracking-wider text-black/50 uppercase">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1.5 rounded-none border-black/15 bg-transparent focus-visible:ring-black/20"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="email" className="text-[11px] tracking-wider text-black/50 uppercase">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 rounded-none border-black/15 bg-transparent focus-visible:ring-black/20"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="phone" className="text-[11px] tracking-wider text-black/50 uppercase">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1.5 rounded-none border-black/15 bg-transparent focus-visible:ring-black/20"
                        placeholder="+48 123 456 789"
                      />
                    </div>
                  </div>
                </section>

                {/* Delivery Method */}
                <section>
                  <h2 className="text-xs font-semibold tracking-widest text-black/80 uppercase">
                    Delivery
                  </h2>
                  <div className="mt-1 h-px w-full bg-black/10" />

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('address')}
                      className={`border p-4 text-left transition-all ${
                        deliveryMethod === 'address'
                          ? 'border-black'
                          : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      <div className="text-xs font-medium tracking-wider uppercase">
                        Address
                      </div>
                      <div className="mt-1 text-[11px] text-black/40">Standard shipping</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('paczkomat')}
                      className={`border p-4 text-left transition-all ${
                        deliveryMethod === 'paczkomat'
                          ? 'border-black'
                          : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      <div className="text-xs font-medium tracking-wider uppercase">
                        DPD Paczkomat
                      </div>
                      <div className="mt-1 text-[11px] text-black/40">Pick up at locker</div>
                    </button>
                  </div>

                  {/* Paczkomat Fields */}
                  {deliveryMethod === 'paczkomat' && (
                    <div className="mt-6 space-y-5">
                      <div>
                        <Label htmlFor="paczkomatPointId" className="text-[11px] tracking-wider text-black/50 uppercase">
                          Paczkomat Point ID
                        </Label>
                        <Input
                          id="paczkomatPointId"
                          type="text"
                          required
                          value={paczkomatPointId}
                          onChange={(e) => setPaczkomatPointId(e.target.value)}
                          className="mt-1.5 rounded-none border-black/15 bg-transparent focus-visible:ring-black/20"
                          placeholder="e.g., KRA01M"
                        />
                        <p className="mt-1 text-[11px] text-black/30">
                          Find your nearest Paczkomat on the DPD website
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Address Fields */}
                  {deliveryMethod === 'address' && (
                    <div className="mt-6">
                      <div>
                        <Label htmlFor="street" className="text-[11px] tracking-wider text-black/50 uppercase">
                          Street Address
                        </Label>
                        <Input
                          id="street"
                          type="text"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="mt-1.5 rounded-none border-black/15 bg-transparent focus-visible:ring-black/20"
                          placeholder="Street name and number"
                        />
                      </div>
                    </div>
                  )}

                  {/* Common Address Fields */}
                  <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
                    <div>
                      <Label htmlFor="city" className="text-[11px] tracking-wider text-black/50 uppercase">
                        City
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1.5 rounded-none border-black/15 bg-transparent focus-visible:ring-black/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="text-[11px] tracking-wider text-black/50 uppercase">
                        Postal Code
                      </Label>
                      <Input
                        id="postalCode"
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="mt-1.5 rounded-none border-black/15 bg-transparent focus-visible:ring-black/20"
                        placeholder="00-000"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="country" className="text-[11px] tracking-wider text-black/50 uppercase">
                        Country
                      </Label>
                      <Input
                        id="country"
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-1.5 rounded-none border-black/15 bg-transparent focus-visible:ring-black/20"
                      />
                    </div>
                  </div>
                </section>

                {/* Payment */}
                <section>
                  <h2 className="text-xs font-semibold tracking-widest text-black/80 uppercase">
                    Payment
                  </h2>
                  <div className="mt-1 h-px w-full bg-black/10" />
                  <p className="mt-4 text-xs leading-relaxed text-black/40">
                    You will be redirected to Stripe for secure payment after placing your order.
                  </p>
                </section>

                {error && (
                  <div className="border border-red-200 px-4 py-3">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full bg-black text-xs font-medium tracking-widest text-white uppercase transition-colors hover:bg-black/85 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>

            {/* Right Column — Order Summary */}
            <div className="order-1 lg:order-2 lg:col-span-5">
              <div className="sticky top-[calc(var(--nav-height)+var(--collections-bar-height)+16px)] lg:pl-8">
                <h2 className="text-xs font-semibold tracking-widest text-black/80 uppercase">
                  Summary
                </h2>
                <div className="mt-1 h-px w-full bg-black/10" />

                {/* Cart Items */}
                <div className="mt-6 space-y-5">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden ">
                        {item.imagePath ? (
                          <Image
                            src={item.imagePath}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-black/15" strokeWidth={1} />
                          </div>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 items-start justify-between">
                        <div>
                          <p className="text-sm font-medium uppercase">{item.name}</p>
                        </div>
                        <p className="text-sm text-black/70">
                          {formatCartPrice(item.priceInCents)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="mt-8 h-px w-full bg-black/10" />
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/40">Subtotal</span>
                    <span className="text-black/70">{formatCartPrice(totalPriceInCents())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/40">Shipping</span>
                    <span className="text-black/70">
                      {shippingCost === 0 ? 'Free' : formatCartPrice(shippingCost)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 h-px w-full bg-black/10" />
                <div className="mt-4 flex justify-between">
                  <span className="text-sm font-semibold tracking-wider uppercase">Total</span>
                  <span className="text-sm font-semibold">{formatCartPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
