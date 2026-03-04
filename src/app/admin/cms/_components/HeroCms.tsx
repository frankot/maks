'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HeroContent } from '@prisma/client'
import { Loader2, Upload, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import ImageUploadSlot from './ImageUploadSlot'

interface ImageSlot {
  url: string
  publicId: string
}

interface ImagePair {
  image1: ImageSlot | null
  image2: ImageSlot | null
}

export default function HeroCms() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null)
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([])
  const [saving, setSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

        // Convert flat arrays to pairs
        const pairs: ImagePair[] = []
        for (let i = 0; i < data.imagePaths.length; i += 2) {
          pairs.push({
            image1:
              i < data.imagePaths.length
                ? { url: data.imagePaths[i]!, publicId: data.imagePublicIds[i] || '' }
                : null,
            image2:
              i + 1 < data.imagePaths.length
                ? { url: data.imagePaths[i + 1]!, publicId: data.imagePublicIds[i + 1] || '' }
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

  const handleImageUpload = async (
    data: ImageSlot,
    pairIndex: number,
    imageSlot: 'image1' | 'image2'
  ) => {
    setImagePairs((prev) => {
      const newPairs = [...prev]
      if (!newPairs[pairIndex]) {
        newPairs[pairIndex] = { image1: null, image2: null }
      }
      newPairs[pairIndex]![imageSlot] = data
      return newPairs
    })
  }

  const addNewPair = () => {
    setImagePairs([{ image1: null, image2: null }, ...imagePairs])
  }

  const removePair = (index: number) => {
    setImagePairs((prev) => prev.filter((_, i) => i !== index))
  }

  const removeImage = (pairIndex: number, slot: 'image1' | 'image2') => {
    setImagePairs((prev) => {
      const newPairs = [...prev]
      newPairs[pairIndex]![slot] = null
      return newPairs
    })
  }

  const saveHeroContent = async () => {
    // Validate that we have at least one complete pair
    const hasCompleteData = imagePairs.some((pair) => pair.image1 || pair.image2)
    if (!hasCompleteData) {
      toast.error('Please add at least one image before saving')
      return
    }

    setSaving(true)

    try {
      const imagePaths: string[] = []
      const imagePublicIds: string[] = []

      imagePairs.forEach((pair) => {
        if (pair.image1) {
          imagePaths.push(pair.image1.url)
          imagePublicIds.push(pair.image1.publicId)
        }
        if (pair.image2) {
          imagePaths.push(pair.image2.url)
          imagePublicIds.push(pair.image2.publicId)
        }
      })

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
      toast.success('Hero content saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      const message = error instanceof Error ? error.message : 'Failed to save hero content'
      toast.error(message)
    } finally {
      setSaving(false)
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
                    Saving...
                  </>
                ) : (
                  'Save'
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
                  {/* Pair Header */}
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

                  {/* Images Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(['image1', 'image2'] as const).map((slot) => {
                      const image = pair[slot]
                      const slotKey = `${pairIndex}-${slot}`
                      const slotLabel = slot === 'image1' ? 'Left' : 'Right'

                      return (
                        <ImageUploadSlot
                          key={slot}
                          imageUrl={image?.url}
                          onUpload={async (data) => {
                            handleImageUpload(data, pairIndex, slot)
                            return data
                          }}
                          onRemove={() => removeImage(pairIndex, slot)}
                          uploadEndpoint="/api/upload/hero"
                          slotId={slotKey}
                          label={slotLabel}
                          altText={`Hero ${slotLabel} image for pair ${imagePairs.length - pairIndex}`}
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
