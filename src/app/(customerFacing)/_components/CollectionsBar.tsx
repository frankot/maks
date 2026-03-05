'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Category } from '@prisma/client'

interface Collection {
  id: string
  name: string
  slug: string
}

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Rings', value: 'RINGS' },
  { label: 'Necklaces', value: 'NECKLACES' },
  { label: 'Earrings', value: 'EARRINGS' },
  { label: 'Bracelets', value: 'BRACELETS' },
  { label: 'Chains', value: 'CHAINS' },
]

interface CollectionsBarProps {
  highlightedCollection?: string | null
  highlightedCategory?: string | null
}

export default function CollectionsBar({
  highlightedCollection,
  highlightedCategory,
}: CollectionsBarProps = {}) {
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections')
        if (response.ok) {
          const data = await response.json()
          setCollections(data)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
      }
    }
    fetchCollections()
  }, [])

  return (
    <>
      {/* Categories */}
      {CATEGORIES.map(({ label, value }) => (
        <Link
          key={value}
          href={`/shop/${value.toLowerCase()}`}
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
