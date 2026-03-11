'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Category } from '@prisma/client'
import { Switch } from '@/components/ui/switch'
import { Upload, Link2, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'
import ImageUploadSlot from '@/components/admin/ImageUploadSlot'
import type { SlotImage } from '@/lib/types/image'
import { uploadFile, deleteCloudinaryImage } from '@/lib/upload'

interface ProductFormProps {
  productId?: string
  onSuccess?: () => void
}

interface Collection {
  id: string
  name: string
  slug: string
}

interface ProductFormRowProps {
  label: string
  description?: string
  children: React.ReactNode
}

function ProductFormRow({ label, description, children }: ProductFormRowProps) {
  return (
    <div className="grid gap-4 border-b py-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8">
      <div className="space-y-1">
        <p className="text-sm font-medium text-black">{label}</p>
        {description ? (
          <p className="text-xs leading-relaxed text-gray-500">{description}</p>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function generateProductId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saveProgress, setSaveProgress] = useState('')
  const [slotImages, setSlotImages] = useState<SlotImage[]>([])
  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    name: '',
    priceInGrosz: '',
    priceInCents: '',
    description: '',
    materials: '',
    isAvailable: true,
    category: 'RINGS' as Category,
    sizes: [] as string[],
    collectionId: '',
    productStatus: 'SHOP' as 'SHOP' | 'ORDERED' | 'SOLD',
  })
  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(false)
  const [ringSizeMin, setRingSizeMin] = useState('4')
  const [ringSizeMax, setRingSizeMax] = useState('12')
  const [newSizeInput, setNewSizeInput] = useState('')

  const isEditing = Boolean(productId)

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${productId}`)
          if (response.ok) {
            const product = await response.json()
            setFormData({
              id: product.id,
              slug: product.slug || '',
              name: product.name,
              priceInGrosz: (product.priceInGrosz / 100).toString(),
              priceInCents: (product.priceInCents / 100).toString(),
              description: product.description,
              materials: (product as { materials?: string | null }).materials || '',
              isAvailable: product.isAvailable,
              category: (product.category ?? 'RINGS') as Category,
              sizes: product.sizes || [],
              collectionId: product.collectionId || '',
              productStatus: product.productStatus || 'SHOP',
            })
            // Restore ring range state from loaded sizes
            if ((product.category ?? 'RINGS') === 'RINGS' && product.sizes?.length > 0) {
              const nums = product.sizes.map(Number).filter((n: number) => !isNaN(n))
              if (nums.length > 0) {
                setRingSizeMin(String(Math.min(...nums)))
                setRingSizeMax(String(Math.max(...nums)))
              }
            }
            setIsIdManuallyEdited(true)

            if (product.imagePublicIds && product.imagePaths) {
              const existingImages: SlotImage[] = product.imagePublicIds.map(
                (publicId: string, index: number) => ({
                  type: 'existing' as const,
                  data: {
                    publicId,
                    url: product.imagePaths[index],
                    width: 800,
                    height: 800,
                    format: 'webp',
                  },
                })
              )
              setSlotImages(existingImages)
            }
          }
        } catch (error) {
          console.error('Error fetching product:', error)
        }
      }
      fetchProduct()
    }
  }, [productId])

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

  useEffect(() => {
    if (!isIdManuallyEdited && formData.name) {
      const generatedSlug = generateProductId(formData.name)
      if (!isEditing) {
        setFormData((prev) => ({ ...prev, slug: generatedSlug, id: prev.id || generatedSlug }))
      } else if (!formData.slug) {
        setFormData((prev) => ({ ...prev, slug: generatedSlug }))
      }
    }
  }, [formData.name, formData.slug, isEditing, isIdManuallyEdited])

  const handleFileSelect = (file: File, previewUrl: string) => {
    setSlotImages((prev) => [...prev, { type: 'pending', data: { file, previewUrl } }])
  }

  const handleBulkFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newImages: SlotImage[] = Array.from(files).map((file) => ({
      type: 'pending' as const,
      data: { file, previewUrl: URL.createObjectURL(file) },
    }))
    setSlotImages((prev) => [...prev, ...newImages])

    event.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    setSlotImages((prev) => {
      const image = prev[index]
      if (image.type === 'existing' && image.data.publicId) {
        setDeletedPublicIds((d) => [...d, image.data.publicId])
      }
      if (image.type === 'pending') {
        URL.revokeObjectURL(image.data.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Upload pending images
      const pendingImages = slotImages.filter((img) => img.type === 'pending')
      const uploadedResults = new Map<number, { url: string; publicId: string }>()

      if (pendingImages.length > 0) {
        setSaveProgress(`Uploading 0/${pendingImages.length}...`)
        let uploadCount = 0
        for (let i = 0; i < slotImages.length; i++) {
          const img = slotImages[i]
          if (img.type === 'pending') {
            uploadCount++
            setSaveProgress(`Uploading ${uploadCount}/${pendingImages.length}...`)
            const result = await uploadFile(img.data.file, '/api/upload')
            uploadedResults.set(i, result)
          }
        }
      }

      // 2. Delete removed images
      for (const publicId of deletedPublicIds) {
        try {
          await deleteCloudinaryImage(publicId, '/api/upload')
        } catch {
          console.warn(`Failed to delete image ${publicId}`)
        }
      }

      // 3. Build final arrays
      setSaveProgress('Saving...')
      const imagePaths: string[] = []
      const imagePublicIds: string[] = []

      slotImages.forEach((img, i) => {
        if (img.type === 'existing') {
          imagePaths.push(img.data.url)
          imagePublicIds.push(img.data.publicId)
        } else {
          const uploaded = uploadedResults.get(i)
          if (uploaded) {
            imagePaths.push(uploaded.url)
            imagePublicIds.push(uploaded.publicId)
          }
        }
      })

      const productData = {
        slug: formData.slug || undefined,
        name: formData.name,
        priceInGrosz: Math.round(parseFloat(formData.priceInGrosz) * 100),
        priceInCents: Math.round(parseFloat(formData.priceInCents) * 100),
        description: formData.description,
        materials: formData.materials || null,
        sizes: formData.category === 'EARRINGS' ? [] : formData.sizes,
        isAvailable: formData.isAvailable,
        category: formData.category,
        collectionId: formData.collectionId || null,
        imagePaths,
        imagePublicIds,
        productStatus: formData.productStatus,
      }

      let response
      if (isEditing && productId) {
        response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
      }

      if (response.ok) {
        // Revoke all pending previews
        slotImages.forEach((img) => {
          if (img.type === 'pending') URL.revokeObjectURL(img.data.previewUrl)
        })
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/admin/products')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error ?? 'Failed to save product')
      }
    } catch {
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
      setSaveProgress('')
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSlugChange = (value: string) => {
    setIsIdManuallyEdited(true)
    handleInputChange('slug', value)
  }

  const handleRegenerateId = () => {
    if (formData.name) {
      const generated = generateProductId(formData.name)
      setFormData((prev) => ({ ...prev, slug: generated, id: prev.id || generated }))
      setIsIdManuallyEdited(false)
    }
  }

  const previewUrl = formData.slug ? `/shop/${formData.slug}` : ''

  // Sync ring size range → formData.sizes whenever min/max or category changes
  useEffect(() => {
    if (formData.category !== 'RINGS') return
    const min = parseInt(ringSizeMin)
    const max = parseInt(ringSizeMax)
    setFormData((prev) => ({
      ...prev,
      sizes:
        min <= max ? Array.from({ length: max - min + 1 }, (_, i) => String(min + i)) : [],
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ringSizeMin, ringSizeMax, formData.category])

  const handleAddSize = () => {
    const trimmed = newSizeInput.trim()
    if (trimmed && !formData.sizes.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, trimmed] }))
      setNewSizeInput('')
    }
  }

  const handleRemoveSize = (size: string) => {
    setFormData((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== size) }))
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl border-t">
      <ProductFormRow label="Product" description="Core catalog details and storefront metadata.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materials</Label>
            <Input
              id="materials"
              type="text"
              value={formData.materials}
              onChange={(e) => handleInputChange('materials', e.target.value)}
              placeholder="e.g. 18k white gold, diamonds"
            />
          </div>
        </div>
      </ProductFormRow>

      <ProductFormRow
        label="Availability"
        description="Control whether the product is visible and its lifecycle status."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="isAvailable">Available</Label>
            <div className="flex h-9 items-center gap-3 border px-3">
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => handleInputChange('isAvailable', checked)}
              />
              <Label htmlFor="isAvailable" className="text-sm text-gray-600">
                {formData.isAvailable ? 'Available' : 'Unavailable'}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="block h-9 w-full border bg-transparent px-3 text-sm transition-colors outline-none focus:border-black"
              value={formData.category}
              onChange={(e) => {
                const newCat = e.target.value as Category
                setFormData((prev) => ({ ...prev, category: newCat, sizes: [] }))
                if (newCat === 'RINGS') {
                  setRingSizeMin('4')
                  setRingSizeMax('12')
                }
                setNewSizeInput('')
              }}
            >
              <option value="RINGS">Rings</option>
              <option value="NECKLACES">Necklaces</option>
              <option value="EARRINGS">Earrings</option>
              <option value="BRACELETS">Bracelets</option>
              <option value="CHAINS">Chains</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection">Collection</Label>
            <select
              id="collection"
              className="block h-9 w-full border bg-transparent px-3 text-sm transition-colors outline-none focus:border-black"
              value={formData.collectionId}
              onChange={(e) => handleInputChange('collectionId', e.target.value)}
            >
              <option value="">No Collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="productStatus">Product Status</Label>
            <select
              id="productStatus"
              className="block h-9 w-full border bg-transparent px-3 text-sm transition-colors outline-none focus:border-black"
              value={formData.productStatus}
              onChange={(e) =>
                handleInputChange('productStatus', e.target.value as 'SHOP' | 'ORDERED' | 'SOLD')
              }
            >
              <option value="SHOP">Shop (Available for purchase)</option>
              <option value="ORDERED">Ordered (Payment received)</option>
              <option value="SOLD">Sold (Shipped/Delivered)</option>
            </select>
          </div>
        </div>
      </ProductFormRow>

      {formData.category !== 'EARRINGS' && (
        <ProductFormRow
          label="Size"
          description={
            formData.category === 'RINGS'
              ? 'Select the available size range. Customers will pick from all sizes in this range.'
              : 'Add each size manually (numbers or letters). Customers will pick from the list.'
          }
        >
          {formData.category === 'RINGS' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-6">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="ringSizeMin">From</Label>
                  <select
                    id="ringSizeMin"
                    className="block h-9 w-full border bg-transparent px-3 text-sm outline-none focus:border-black"
                    value={ringSizeMin}
                    onChange={(e) => setRingSizeMin(e.target.value)}
                  >
                    {Array.from({ length: 9 }, (_, i) => i + 4).map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="ringSizeMax">To</Label>
                  <select
                    id="ringSizeMax"
                    className="block h-9 w-full border bg-transparent px-3 text-sm outline-none focus:border-black"
                    value={ringSizeMax}
                    onChange={(e) => setRingSizeMax(e.target.value)}
                  >
                    {Array.from({ length: 9 }, (_, i) => i + 4).map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.sizes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {formData.sizes.map((s) => (
                    <span key={s} className="inline-flex items-center border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-600">Min must be ≤ Max to generate sizes.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSize()
                    }
                  }}
                  placeholder="e.g. S, M, L, 45cm, 50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSize}
                  disabled={!newSizeInput.trim()}
                  className="shrink-0 px-4"
                >
                  Add
                </Button>
              </div>
              {formData.sizes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {formData.sizes.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs">
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(s)}
                        className="text-gray-400 hover:text-black"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No sizes added — size selector will be hidden in storefront.</p>
              )}
            </div>
          )}
        </ProductFormRow>
      )}

      <ProductFormRow
        label="URL"
        description="Used for the storefront route. Auto-generated from the product name."
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              placeholder="product-slug"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRegenerateId}
              disabled={!formData.name}
              className="px-3"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {previewUrl ? (
            <div className="flex items-center gap-2 border px-3 py-2 text-sm text-gray-600">
              <Link2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Preview URL</span>
              <code className="font-mono text-black">{previewUrl}</code>
            </div>
          ) : null}
        </div>
      </ProductFormRow>

      <ProductFormRow
        label="Pricing"
        description="Store both PLN and EUR values used in checkout and admin views."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="priceInGrosz">Price (PLN)</Label>
            <Input
              id="priceInGrosz"
              type="number"
              step="0.01"
              min="0"
              value={formData.priceInGrosz}
              onChange={(e) => handleInputChange('priceInGrosz', e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceInCents">Price (EUR)</Label>
            <Input
              id="priceInCents"
              type="number"
              step="0.01"
              min="0"
              value={formData.priceInCents}
              onChange={(e) => handleInputChange('priceInCents', e.target.value)}
              required
              placeholder="0.00"
            />
          </div>
        </div>
      </ProductFormRow>

      <ProductFormRow
        label="Description"
        description="Long-form copy displayed on the product page."
      >
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          required
          placeholder="Enter product description"
          rows={6}
        />
      </ProductFormRow>

      <ProductFormRow
        label="Images"
        description="Upload and reorder the images used for the gallery and product cards."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">Square images work best across the storefront.</p>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleBulkFileSelect}
                className="hidden"
                id="bulk-image-upload"
              />
              <Label
                htmlFor="bulk-image-upload"
                className="inline-flex h-9 cursor-pointer items-center gap-2 border px-3 text-sm transition-colors hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                Upload Multiple
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {slotImages.map((img, index) => {
              const imageUrl = img.type === 'existing' ? img.data.url : img.data.previewUrl
              return (
                <ImageUploadSlot
                  key={`${img.type}-${index}`}
                  imageUrl={imageUrl}
                  onFileSelect={(file, previewUrl) => {
                    setSlotImages((prev) => {
                      const old = prev[index]
                      if (old.type === 'existing' && old.data.publicId) {
                        setDeletedPublicIds((d) => [...d, old.data.publicId])
                      }
                      if (old.type === 'pending') {
                        URL.revokeObjectURL(old.data.previewUrl)
                      }
                      const newImages = [...prev]
                      newImages[index] = { type: 'pending', data: { file, previewUrl } }
                      return newImages
                    })
                  }}
                  onRemove={() => handleRemoveImage(index)}
                  slotId={`product-image-${index}`}
                  label={`Image ${index + 1}`}
                  altText={`Product image ${index + 1}`}
                  aspectRatio="aspect-square"
                  isPending={img.type === 'pending'}
                />
              )
            })}

            <ImageUploadSlot
              imageUrl={null}
              onFileSelect={handleFileSelect}
              slotId="product-image-new"
              label="new"
              altText="Add product image"
              aspectRatio="aspect-square"
              showRemoveButton={false}
            />
          </div>
        </div>
      </ProductFormRow>

      <div className="flex justify-end gap-3 py-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? saveProgress || 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  )
}
