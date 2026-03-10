'use client'

import { useCurrencyStore } from '@/stores/currency-store'
import { formatCartPrice } from '@/lib/cart'

interface DesktopProductPriceProps {
  priceInGrosz: number
  priceInCents: number
}

export default function DesktopProductPrice({
  priceInGrosz,
  priceInCents,
}: DesktopProductPriceProps) {
  const currency = useCurrencyStore((s) => s.currency)
  const amount = currency === 'EUR' ? priceInCents : priceInGrosz

  return <p className="text-sm">{formatCartPrice(amount, currency)}</p>
}
