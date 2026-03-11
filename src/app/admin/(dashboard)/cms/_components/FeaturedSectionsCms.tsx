'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface ProductOption {
  id: string
  name: string
  category: string
  priceInGrosz: number
}

interface SectionData {
  title: string
  href: string
  productIds: string[]
}

const EMPTY: SectionData = { title: '', href: '', productIds: [] }

interface SectionCardProps {
  slot: number
  data: SectionData
  onChange: (data: SectionData) => void
  allProducts: ProductOption[]
  saving: boolean
  clearing: boolean
  onSave: () => void
  onClear: () => void
}

function SectionCard({
  slot,
  data,
  onChange,
  allProducts,
  saving,
  clearing,
  onSave,
  onClear,
}: SectionCardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addProduct = (id: string) => {
    if (data.productIds.includes(id)) return
    if (data.productIds.length >= 12) {
      toast.error('Maximum 12 products per section')
      return
    }
    onChange({ ...data, productIds: [...data.productIds, id] })
  }

  const removeProduct = (id: string) => {
    onChange({ ...data, productIds: data.productIds.filter((pid) => pid !== id) })
  }

  const selectedProducts = data.productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as ProductOption[]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section {slot}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`title-${slot}`}>Title</Label>
          <Input
            id={`title-${slot}`}
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="e.g. Rings"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`href-${slot}`}>Link URL</Label>
          <Input
            id={`href-${slot}`}
            value={data.href}
            onChange={(e) => onChange({ ...data, href: e.target.value })}
            placeholder="/shop/rings"
          />
        </div>

        {selectedProducts.length > 0 && (
          <div className="space-y-2">
            <Label>Selected products ({selectedProducts.length}/12)</Label>
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((p, i) => (
                <span
                  key={p.id}
                  className="flex items-center gap-1 rounded-full border border-black/20 px-3 py-1 text-sm"
                >
                  <span className="text-black/40">#{i + 1}</span>
                  <span>{p.name}</span>
                  <button
                    type="button"
                    onClick={() => removeProduct(p.id)}
                    className="ml-1 rounded-full hover:text-red-500"
                    aria-label={`Remove ${p.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Add products</Label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter products by name..."
          />
          <div className="max-h-48 overflow-y-auto rounded-md border border-black/10">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-black/40">No products found</div>
            ) : (
              filtered.map((p) => {
                const selected = data.productIds.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={selected}
                    onClick={() => addProduct(p.id)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-black/40">{p.category}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClear} disabled={clearing || saving}>
            {clearing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              'Clear (use auto)'
            )}
          </Button>
          <Button onClick={onSave} disabled={saving || clearing}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FeaturedSectionsCms() {
  const [allProducts, setAllProducts] = useState<ProductOption[]>([])
  const [section1, setSection1] = useState<SectionData>(EMPTY)
  const [section2, setSection2] = useState<SectionData>(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const [saving1, setSaving1] = useState(false)
  const [saving2, setSaving2] = useState(false)
  const [clearing1, setClearing1] = useState(false)
  const [clearing2, setClearing2] = useState(false)

  useEffect(() => {
    void loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const [productsRes, sec1Res, sec2Res] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/featured-sections/1'),
        fetch('/api/featured-sections/2'),
      ])

      if (productsRes.ok) {
        const products: ProductOption[] = await productsRes.json()
        setAllProducts(products)
      }

      if (sec1Res.ok) {
        const sec1 = await sec1Res.json()
        if (sec1) {
          setSection1({
            title: sec1.title,
            href: sec1.href,
            productIds: sec1.items.map((i: { productId: string }) => i.productId),
          })
        }
      }

      if (sec2Res.ok) {
        const sec2 = await sec2Res.json()
        if (sec2) {
          setSection2({
            title: sec2.title,
            href: sec2.href,
            productIds: sec2.items.map((i: { productId: string }) => i.productId),
          })
        }
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (slot: number) => {
    const data = slot === 1 ? section1 : section2
    const setSaving = slot === 1 ? setSaving1 : setSaving2

    if (!data.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!data.href.trim()) {
      toast.error('Link URL is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/featured-sections/${slot}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: data.title, href: data.href, productIds: data.productIds }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success(`Section ${slot} saved!`)
    } catch {
      toast.error(`Failed to save section ${slot}`)
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async (slot: number) => {
    const setClearing = slot === 1 ? setClearing1 : setClearing2
    const setSection = slot === 1 ? setSection1 : setSection2

    setClearing(true)
    try {
      const res = await fetch(`/api/featured-sections/${slot}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to clear')
      setSection(EMPTY)
      toast.success(`Section ${slot} cleared — home will use auto fallback`)
    } catch {
      toast.error(`Failed to clear section ${slot}`)
    } finally {
      setClearing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span>Loading sections...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionCard
        slot={1}
        data={section1}
        onChange={setSection1}
        allProducts={allProducts}
        saving={saving1}
        clearing={clearing1}
        onSave={() => handleSave(1)}
        onClear={() => handleClear(1)}
      />

      <SectionCard
        slot={2}
        data={section2}
        onChange={setSection2}
        allProducts={allProducts}
        saving={saving2}
        clearing={clearing2}
        onSave={() => handleSave(2)}
        onClear={() => handleClear(2)}
      />
    </div>
  )
}
