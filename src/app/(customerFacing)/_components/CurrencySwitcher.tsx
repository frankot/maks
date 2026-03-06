'use client'

import { useCurrencyStore } from '@/stores/currency-store'

export default function CurrencySwitcher({ className = '' }: { className?: string }) {
  const { currency, setCurrency } = useCurrencyStore()

  return (
    <div className={`flex items-center gap-1 text-xs tracking-wider ${className}`}>
      <button
        onClick={() => setCurrency('PLN')}
        className={`transition-colors ${
          currency === 'PLN' ? 'font-bold text-black' : 'text-black/40 hover:text-black/70'
        }`}
      >
        PLN
      </button>
      <span className="text-black/20">|</span>
      <button
        onClick={() => setCurrency('EUR')}
        className={`transition-colors ${
          currency === 'EUR' ? 'font-bold text-black' : 'text-black/40 hover:text-black/70'
        }`}
      >
        EUR
      </button>
    </div>
  )
}
