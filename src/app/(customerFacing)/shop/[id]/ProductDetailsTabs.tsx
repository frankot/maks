'use client'

import React, { useState } from 'react'

type Section = 'DETAILS' | 'MATERIAL' | 'CARE'

interface ProductDetailsTabsProps {
  details: React.ReactNode
  material: React.ReactNode
  care: React.ReactNode
}

export default function ProductDetailsTabs({ details, material, care }: ProductDetailsTabsProps) {
  const [activeSection, setActiveSection] = useState<Section>('DETAILS')

  const sections: { name: Section; content: React.ReactNode }[] = [
    { name: 'DETAILS', content: details },
    { name: 'MATERIAL', content: material },
    { name: 'CARE', content: care },
  ]

  return (
    <div className="mt-10">
      <div className="grid grid-cols-3">
        {sections.map((section) => (
          <button
            key={section.name}
            onClick={() => setActiveSection(section.name)}
            className={`py-3 text-xs tracking-wider uppercase transition-colors ${
              activeSection === section.name
                ? 'border-b border-black font-bold text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      <div className="py-6 text-xs leading-relaxed text-gray-600">
        {sections.find((s) => s.name === activeSection)?.content}
      </div>
    </div>
  )
}
