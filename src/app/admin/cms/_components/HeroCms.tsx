'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HeroContent } from '@prisma/client'
import { Loader2, Upload, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import ImageUploadSlot from '@/components/admin/ImageUploadSlot'
import type { SlotImage } from '@/lib/types/image'
import { uploadFile, deleteCloudinaryImage } from '@/lib/upload'

interface ImagePair {
  image1: SlotImage | null
  image2: SlotImage | null
}

export default function HeroCms() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null)
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([])
  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const hasUnsavedChanges =
    deletedPublicIds.length > 0 ||
    imagePairs.some(
      (pair) =>
        (pair.image1 && pair.image1.type === 'pending') ||
        (pair.image2 && pair.image2.type === 'pending')
    )

  useEffect(() => {
    void fetchHeroContent()
  }, [])

  const fetchHeroContent = async () => {
    try {
      const response = await fetch('/api/hero')

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const data: HeroContent | null = await response.json()

      if (data) {
        setHeroContent(data)

        const pairs: ImagePair[] = []
        for (let i = 0; i < data.imagePaths.length; i += 2) {
          pairs.push({
            image1:
              i < data.imagePaths.length
                ? {
                    type: 'existing',
                    data: { url: data.imagePaths[i]!, publicId: data.imagePublicIds[i] || '' },
                  }
                : null,
            image2:
              i + 1 < data.imagePaths.length
                ? {
                    type: 'existing',
                    data: {
                      url: data.imagePaths[i + 1]!,
                      publicId: data.imagePublicIds[i + 1] || '',
                    },
                  }
                : null,
          })
        }
        setImagePairs(pairs)
      }
    } catch (error) {
      console.error('Error fetching hero content:', error)
      const message = error instanceof Error ? error.message : 'Failed to load hero content'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (
    file: File,
    previewUrl: string,
    pairIndex: number,
    imageSlot: 'image1' | 'image2'
  ) => {
    setImagePairs((prev) => {
      const newPairs = [...prev]
      if (!newPairs[pairIndex]) {
        newPairs[pairIndex] = { image1: null, image2: null }
      }
      // Revoke old pending preview if replacing
      const old = newPairs[pairIndex]![imageSlot]
      if (old?.type === 'pending') {
        URL.revokeObjectURL(old.data.previewUrl)
      }
      newPairs[pairIndex]![imageSlot] = { type: 'pending', data: { file, previewUrl } }
      return newPairs
    })
  }

  const addNewPair = () => {
    setImagePairs([{ image1: null, image2: null }, ...imagePairs])
  }

  const removePair = (index: number) => {
    const pair = imagePairs[index]!
    // Track existing images for deletion and revoke pending previews
    for (const slot of [pair.image1, pair.image2]) {
      if (slot?.type === 'existing' && slot.data.publicId) {
        setDeletedPublicIds((prev) => [...prev, slot.data.publicId])
      }
      if (slot?.type === 'pending') {
        URL.revokeObjectURL(slot.data.previewUrl)
      }
    }
    setImagePairs((prev) => prev.filter((_, i) => i !== index))
  }

  const removeImage = (pairIndex: number, slot: 'image1' | 'image2') => {
    setImagePairs((prev) => {
      const newPairs = [...prev]
      const image = newPairs[pairIndex]![slot]
      if (image?.type === 'existing' && image.data.publicId) {
        setDeletedPublicIds((prev) => [...prev, image.data.publicId])
      }
      if (image?.type === 'pending') {
        URL.revokeObjectURL(image.data.previewUrl)
      }
      newPairs[pairIndex]![slot] = null
      return newPairs
    })
  }

  const saveHeroContent = async () => {
    const hasCompleteData = imagePairs.some((pair) => pair.image1 || pair.image2)
    if (!hasCompleteData) {
      toast.error('Please add at least one image before saving')
      return
    }

    setSaving(true)

    try {
      // 1. Upload all pending images
      const pendingFiles: { file: File; pairIndex: number; slot: 'image1' | 'image2' }[] = []
      imagePairs.forEach((pair, pairIndex) => {
        if (pair.image1?.type === 'pending') {
          pendingFiles.push({ file: pair.image1.data.file, pairIndex, slot: 'image1' })
        }
        if (pair.image2?.type === 'pending') {
          pendingFiles.push({ file: pair.image2.data.file, pairIndex, slot: 'image2' })
        }
      })

      if (pendingFiles.length > 0) {
        setSaveProgress(`Uploading 0/${pendingFiles.length}...`)
      }

      const uploadResults = new Map<string, { url: string; publicId: string }>()
      for (let i = 0; i < pendingFiles.length; i++) {
        const { file, pairIndex, slot } = pendingFiles[i]
        setSaveProgress(`Uploading ${i + 1}/${pendingFiles.length}...`)
        const result = await uploadFile(file, '/api/upload/hero')
        uploadResults.set(`${pairIndex}-${slot}`, result)
      }

      // 2. Delete removed images
      for (const publicId of deletedPublicIds) {
        try {
          await deleteCloudinaryImage(publicId, '/api/upload/hero')
        } catch {
          console.warn(`Failed to delete image ${publicId}`)
        }
      }

      // 3. Build final arrays with uploaded URLs replacing pending
      const imagePaths: string[] = []
      const imagePublicIds: string[] = []
      const updatedPairs: ImagePair[] = []

      imagePairs.forEach((pair, pairIndex) => {
        const resolveSlot = (
          slotImage: SlotImage | null,
          slot: 'image1' | 'image2'
        ): SlotImage | null => {
          if (!slotImage) return null
          if (slotImage.type === 'existing') return slotImage
          const uploaded = uploadResults.get(`${pairIndex}-${slot}`)
          if (uploaded) {
            return { type: 'existing', data: { url: uploaded.url, publicId: uploaded.publicId } }
          }
          return null
        }

        const resolved1 = resolveSlot(pair.image1, 'image1')
        const resolved2 = resolveSlot(pair.image2, 'image2')

        updatedPairs.push({ image1: resolved1, image2: resolved2 })

        if (resolved1 && resolved1.type === 'existing') {
          imagePaths.push(resolved1.data.url)
          imagePublicIds.push(resolved1.data.publicId)
        }
        if (resolved2 && resolved2.type === 'existing') {
          imagePaths.push(resolved2.data.url)
          imagePublicIds.push(resolved2.data.publicId)
        }
      })

      // 4. Save to DB
      setSaveProgress('Saving...')
      const payload = { imagePaths, imagePublicIds }
      const url = '/api/hero'
      const method = heroContent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroContent ? { ...payload, id: heroContent.id } : payload),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to save hero content'
        try {
          const error = await response.json()
          errorMessage = error.error || error.message || errorMessage
        } catch {
          errorMessage = `Save failed with status ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const savedContent: HeroContent = await response.json()
      setHeroContent(savedContent)

      // 5. Revoke pending previews and update state
      pendingFiles.forEach(({ pairIndex, slot }) => {
        const img = imagePairs[pairIndex]?.[slot]
        if (img?.type === 'pending') {
          URL.revokeObjectURL(img.data.previewUrl)
        }
      })
      setImagePairs(updatedPairs)
      setDeletedPublicIds([])

      toast.success('Hero content saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      const message = error instanceof Error ? error.message : 'Failed to save hero content'
      toast.error(message)
    } finally {
      setSaving(false)
      setSaveProgress('')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hero Section Management</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Upload image pairs for your hero carousel
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveHeroContent}
                disabled={saving}
                variant="outline"
                size="sm"
                className="gap-2 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {saveProgress || 'Saving...'}
                  </>
                ) : (
                  <>
                    Save
                    {hasUnsavedChanges && (
                      <span className="ml-1 h-2 w-2 rounded-full bg-amber-500" />
                    )}
                  </>
                )}
              </Button>
              <Button onClick={addNewPair} type="button" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Pair
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {imagePairs.length === 0 ? (
            <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-12 text-center">
              <Upload className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
              <p className="text-muted-foreground mb-4">No image pairs yet</p>
              <Button onClick={addNewPair} variant="outline" type="button">
                Add First Pair
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {imagePairs.map((pair, pairIndex) => (
                <div
                  key={pairIndex}
                  className="bg-card hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">
                      Pair {imagePairs.length - pairIndex}
                      <span className="text-muted-foreground ml-2 text-sm font-normal">
                        ({[pair.image1, pair.image2].filter(Boolean).length}/2 images)
                      </span>
                    </h3>
                    <Button
                      onClick={() => removePair(pairIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(['image1', 'image2'] as const).map((slot) => {
                      const image = pair[slot]
                      const slotKey = `${pairIndex}-${slot}`
                      const slotLabel = slot === 'image1' ? 'Left' : 'Right'
                      const imageUrl = image
                        ? image.type === 'existing'
                          ? image.data.url
                          : image.data.previewUrl
                        : null

                      return (
                        <ImageUploadSlot
                          key={slot}
                          imageUrl={imageUrl}
                          onFileSelect={(file, previewUrl) =>
                            handleFileSelect(file, previewUrl, pairIndex, slot)
                          }
                          onRemove={() => removeImage(pairIndex, slot)}
                          slotId={slotKey}
                          label={slotLabel}
                          altText={`Hero ${slotLabel} image for pair ${imagePairs.length - pairIndex}`}
                          isPending={image?.type === 'pending'}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
