import React from 'react'

interface ProductDetailsSectionProps {
  title: string
  children: React.ReactNode
}

export default function ProductDetailsSection({ title, children }: ProductDetailsSectionProps) {
  return (
    <details className="border-b border-black pb-1">
      <summary className="flex cursor-pointer items-center justify-between text-xs tracking-wider uppercase">
        <span>{title}</span>
        <span className="text-base">&#x2304;</span>
      </summary>
      <div className="mt-3 text-xs leading-relaxed text-gray-600">{children}</div>
    </details>
  )
}
