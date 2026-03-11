'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { HeroContent } from '@prisma/client'
import { Loader2, Upload, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import ImageUploadSlot from '@/components/admin/ImageUploadSlot'
import type { SlotImage } from '@/lib/types/image'
import { uploadFile, deleteCloudinaryImage } from '@/lib/upload'

interface ImagePair {
  id: string
  image1: SlotImage | null
  image2: SlotImage | null
}

function createImagePair(
  image1: SlotImage | null = null,
  image2: SlotImage | null = null
): ImagePair {
  return {
    id: crypto.randomUUID(),
    image1,
    image2,
  }
}

export default function HeroCms() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null)
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([])
  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pairPendingDelete, setPairPendingDelete] = useState<ImagePair | null>(null)
  const [deletingPairId, setDeletingPairId] = useState<string | null>(null)

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
          const image1 =
            i < data.imagePaths.length
              ? {
                  type: 'existing' as const,
                  data: { url: data.imagePaths[i]!, publicId: data.imagePublicIds[i] || '' },
                }
              : null

          const image2 =
            i + 1 < data.imagePaths.length
              ? {
                  type: 'existing' as const,
                  data: {
                    url: data.imagePaths[i + 1]!,
                    publicId: data.imagePublicIds[i + 1] || '',
                  },
                }
              : null

          pairs.push(createImagePair(image1, image2))
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
    pairId: string,
    imageSlot: 'image1' | 'image2'
  ) => {
    setImagePairs((prev) => {
      const pair = prev.find((item) => item.id === pairId)

      if (!pair) {
        return prev
      }

      const old = pair[imageSlot]
      if (old?.type === 'pending') {
        URL.revokeObjectURL(old.data.previewUrl)
      }

      return prev.map((item) =>
        item.id === pairId
          ? {
              ...item,
              [imageSlot]: { type: 'pending' as const, data: { file, previewUrl } },
            }
          : item
      )
    })
  }

  const addNewPair = () => {
    setImagePairs((prev) => [createImagePair(), ...prev])
  }

  const removePairLocally = (pairId: string) => {
    setImagePairs((prev) => {
      const pair = prev.find((item) => item.id === pairId)

      if (!pair) {
        return prev
      }

      for (const slot of [pair.image1, pair.image2]) {
        if (slot?.type === 'pending') {
          URL.revokeObjectURL(slot.data.previewUrl)
        }
      }

      return prev.filter((item) => item.id !== pairId)
    })
  }

  const confirmRemovePair = async () => {
    if (!pairPendingDelete) {
      return
    }

    const pairToDelete = pairPendingDelete
    const existingSlots = [pairToDelete.image1, pairToDelete.image2].filter(
      (slot): slot is Extract<SlotImage, { type: 'existing' }> => {
        return Boolean(slot && slot.type === 'existing' && slot.data.publicId)
      }
    )
    const publicIdsToDelete = existingSlots.map((slot) => slot.data.publicId)

    setDeletingPairId(pairToDelete.id)

    try {
      if (heroContent && publicIdsToDelete.length > 0) {
        const filteredImages = heroContent.imagePaths.reduce<
          { imagePath: string; publicId: string }[]
        >((acc, imagePath, index) => {
          const publicId = heroContent.imagePublicIds[index]

          if (!publicId || publicIdsToDelete.includes(publicId)) {
            return acc
          }

          acc.push({ imagePath, publicId })
          return acc
        }, [])

        const response = await fetch('/api/hero', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: heroContent.id,
            imagePaths: filteredImages.map((item) => item.imagePath),
            imagePublicIds: filteredImages.map((item) => item.publicId),
          }),
        })

        if (!response.ok) {
          let errorMessage = 'Failed to delete hero pair'
          try {
            const error = await response.json()
            errorMessage = error.error || error.message || errorMessage
          } catch {
            errorMessage = `Delete failed with status ${response.status}`
          }
          throw new Error(errorMessage)
        }

        const updatedHeroContent: HeroContent = await response.json()
        setHeroContent(updatedHeroContent)

        for (const publicId of publicIdsToDelete) {
          await deleteCloudinaryImage(publicId, '/api/upload/hero')
        }
      }

      removePairLocally(pairToDelete.id)
      setDeletedPublicIds((current) =>
        current.filter((publicId) => !publicIdsToDelete.includes(publicId))
      )
      setPairPendingDelete(null)
      toast.success('Hero pair deleted')
    } catch (error) {
      console.error('Pair delete error:', error)
      const message = error instanceof Error ? error.message : 'Failed to delete hero pair'
      toast.error(message)
    } finally {
      setDeletingPairId(null)
    }
  }

  const removeImage = (pairId: string, slot: 'image1' | 'image2') => {
    setImagePairs((prev) => {
      const pair = prev.find((item) => item.id === pairId)

      if (!pair) {
        return prev
      }

      const image = pair[slot]
      if (image?.type === 'existing' && image.data.publicId) {
        setDeletedPublicIds((prev) => [...prev, image.data.publicId])
      }
      if (image?.type === 'pending') {
        URL.revokeObjectURL(image.data.previewUrl)
      }

      return prev.map((item) => (item.id === pairId ? { ...item, [slot]: null } : item))
    })
  }

  const saveHeroContent = async () => {
    const hasImages = imagePairs.some((pair) => pair.image1 || pair.image2)
    const canSaveEmptyExistingHero = Boolean(heroContent && deletedPublicIds.length > 0)

    if (!hasImages && !canSaveEmptyExistingHero) {
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

      // 2. Build final arrays with uploaded URLs replacing pending
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

        updatedPairs.push({ id: pair.id, image1: resolved1, image2: resolved2 })

        if (resolved1 && resolved1.type === 'existing') {
          imagePaths.push(resolved1.data.url)
          imagePublicIds.push(resolved1.data.publicId)
        }
        if (resolved2 && resolved2.type === 'existing') {
          imagePaths.push(resolved2.data.url)
          imagePublicIds.push(resolved2.data.publicId)
        }
      })

      // 3. Save to DB first so Cloudinary cleanup only happens after persistence succeeds.
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

      // 4. Delete removed images from Cloudinary.
      const failedDeleteIds: string[] = []
      const uniqueDeletedPublicIds = [...new Set(deletedPublicIds)]

      if (uniqueDeletedPublicIds.length > 0) {
        setSaveProgress('Cleaning up removed images...')
      }

      for (const publicId of uniqueDeletedPublicIds) {
        try {
          await deleteCloudinaryImage(publicId, '/api/upload/hero')
        } catch (error) {
          console.warn(`Failed to delete image ${publicId}`, error)
          failedDeleteIds.push(publicId)
        }
      }

      // 5. Revoke pending previews and update state
      pendingFiles.forEach(({ pairIndex, slot }) => {
        const img = imagePairs[pairIndex]?.[slot]
        if (img?.type === 'pending') {
          URL.revokeObjectURL(img.data.previewUrl)
        }
      })
      setImagePairs(updatedPairs)
      setDeletedPublicIds(failedDeleteIds)

      if (failedDeleteIds.length > 0) {
        toast.error(
          'Hero content saved, but some removed images could not be deleted from Cloudinary'
        )
      } else {
        toast.success('Hero content saved successfully!')
      }
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
                  key={pair.id}
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
                      onClick={() => setPairPendingDelete(pair)}
                      variant="ghost"
                      size="sm"
                      disabled={saving || deletingPairId === pair.id}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      {deletingPairId === pair.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(['image1', 'image2'] as const).map((slot) => {
                      const image = pair[slot]
                      const slotKey = `${pair.id}-${slot}`
                      const slotLabel = slot === 'image1' ? 'Left' : 'Right'
                      const slotState = image ? image.type : 'empty'
                      const imageUrl = image
                        ? image.type === 'existing'
                          ? image.data.url
                          : image.data.previewUrl
                        : null

                      return (
                        <ImageUploadSlot
                          key={`${slotKey}-${slotState}`}
                          imageUrl={imageUrl}
                          onFileSelect={(file, previewUrl) =>
                            handleFileSelect(file, previewUrl, pair.id, slot)
                          }
                          onRemove={() => removeImage(pair.id, slot)}
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

      <AlertDialog
        open={pairPendingDelete !== null}
        onOpenChange={(open) => !open && setPairPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image pair?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove both images from the hero section permanently. <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingPairId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemovePair}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingPairId !== null}
            >
              {deletingPairId !== null ? 'Deleting...' : 'Delete Pair'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
