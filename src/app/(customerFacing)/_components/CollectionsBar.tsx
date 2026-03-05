'use client'

import Link from 'next/link'
import type { Category } from '@prisma/client'

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Rings', value: 'RINGS' },
  { label: 'Necklaces', value: 'NECKLACES' },
  { label: 'Earrings', value: 'EARRINGS' },
  { label: 'Bracelets', value: 'BRACELETS' },
  { label: 'Chains', value: 'CHAINS' },
]

interface CollectionsBarProps {
  collections: { id: string; name: string; slug: string }[]
  highlightedCollection?: string | null
  highlightedCategory?: string | null
}

export default function CollectionsBar({
  collections,
  highlightedCollection,
  highlightedCategory,
}: CollectionsBarProps) {
  return (
    <>
      {/* Categories */}
      {CATEGORIES.map(({ label, value }) => (
        <Link
          key={value}
          href={`/shop/${value.toLowerCase()}`}
          scroll={false}
          className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
            highlightedCategory === value
              ? 'font-bold text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          {label}
        </Link>
      ))}

      <div className="mx-2 h-4 w-px bg-gray-300" />

      <Link
        href="/shop"
        scroll={false}
        className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
          !highlightedCollection && !highlightedCategory
            ? 'font-bold text-black'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        All
      </Link>

      {collections.map((c) => (
        <Link
          key={c.id}
          href={`/shop/${c.slug}`}
          scroll={false}
          className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
            highlightedCollection === c.slug
              ? 'font-bold text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          {c.name}
        </Link>
      ))}
    </>
  )
}
