'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import ImageUploadSlot from '@/components/admin/ImageUploadSlot'
import { uploadFile } from '@/lib/upload'

interface PhotoArtist {
  id: string
  name: string
}

interface GalleryImage {
  id: string
  imagePath: string
  publicId: string
  order: number
  artistId: string
  artist: PhotoArtist
}

interface GalleryRow {
  id: string
  layout: 'THREE_COL' | 'FIVE_COL'
  order: number
  images: GalleryImage[]
}

interface PendingSlot {
  file: File
  previewUrl: string
  artistId: string
}

export default function GalleryCms() {
  const [rows, setRows] = useState<GalleryRow[]>([])
  const [artists, setArtists] = useState<PhotoArtist[]>([])
  const [newArtistName, setNewArtistName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [addingArtist, setAddingArtist] = useState(false)
  const [deletingRows, setDeletingRows] = useState<Record<string, boolean>>({})
  const [addingRow, setAddingRow] = useState(false)
  const [rowArtistIds, setRowArtistIds] = useState<Record<string, string>>({})

  // Deferred state
  const [pendingSlots, setPendingSlots] = useState<Map<string, Map<number, PendingSlot>>>(new Map())
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState('')

  const hasUnsavedChanges = pendingSlots.size > 0 || deletedImageIds.length > 0

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    try {
      const [rowsRes, artistsRes] = await Promise.all([
        fetch('/api/gallery/rows'),
        fetch('/api/photo-artists'),
      ])

      if (rowsRes.ok) {
        const rowsData: GalleryRow[] = await rowsRes.json()
        setRows(rowsData)
        // Initialize row artist selections from existing images
        const initialArtists: Record<string, string> = {}
        for (const row of rowsData) {
          if (row.images.length > 0) {
            initialArtists[row.id] = row.images[0].artistId
          }
        }
        setRowArtistIds((prev) => ({ ...initialArtists, ...prev }))
      }
      if (artistsRes.ok) {
        const artistsData: PhotoArtist[] = await artistsRes.json()
        setArtists(artistsData)
      }
    } catch {
      toast.error('Failed to load gallery data')
    } finally {
      setIsLoading(false)
    }
  }

  // --- Artist Management ---
  const handleAddArtist = async () => {
    if (!newArtistName.trim()) return
    setAddingArtist(true)
    try {
      const res = await fetch('/api/photo-artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newArtistName.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to add artist')
        return
      }

      const artist: PhotoArtist = await res.json()
      setArtists((prev) => [...prev, artist].sort((a, b) => a.name.localeCompare(b.name)))
      setNewArtistName('')
      toast.success('Artist added')
    } catch {
      toast.error('Failed to add artist')
    } finally {
      setAddingArtist(false)
    }
  }

  const handleDeleteArtist = async (id: string) => {
    try {
      const res = await fetch('/api/photo-artists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete artist')
        return
      }

      setArtists((prev) => prev.filter((a) => a.id !== id))
      toast.success('Artist deleted')
    } catch {
      toast.error('Failed to delete artist')
    }
  }

  // --- Row Management (immediate) ---
  const handleAddRow = async (layout: 'THREE_COL' | 'FIVE_COL') => {
    setAddingRow(true)
    try {
      const order = rows.length
      const res = await fetch('/api/gallery/rows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, order }),
      })

      if (!res.ok) throw new Error('Failed to create row')

      const row: GalleryRow = await res.json()
      setRows((prev) => [{ ...row, images: [] }, ...prev])
      toast.success(`Added ${layout === 'THREE_COL' ? '3-column' : '5-column'} row`)
    } catch {
      toast.error('Failed to add row')
    } finally {
      setAddingRow(false)
    }
  }

  const handleDeleteRow = async (rowId: string) => {
    setDeletingRows((prev) => ({ ...prev, [rowId]: true }))
    try {
      const res = await fetch('/api/gallery/rows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rowId }),
      })

      if (!res.ok) throw new Error('Failed to delete row')

      // Clean up any pending slots for this row
      setPendingSlots((prev) => {
        const next = new Map(prev)
        next.delete(rowId)
        return next
      })

      setRows((prev) => prev.filter((r) => r.id !== rowId))
      toast.success('Row deleted')
    } catch {
      toast.error('Failed to delete row')
    } finally {
      setDeletingRows((prev) => {
        const newState = { ...prev }
        delete newState[rowId]
        return newState
      })
    }
  }

  // --- Image Management (deferred) ---
  const handleFileSelect = (
    file: File,
    previewUrl: string,
    rowId: string,
    slotIndex: number,
    artistId: string
  ) => {
    setPendingSlots((prev) => {
      const next = new Map(prev)
      const rowSlots = new Map(next.get(rowId) || new Map())
      // Revoke old preview if replacing
      const old = rowSlots.get(slotIndex)
      if (old) URL.revokeObjectURL(old.previewUrl)
      rowSlots.set(slotIndex, { file, previewUrl, artistId })
      next.set(rowId, rowSlots)
      return next
    })
  }

  const handleRemoveImage = (imageId: string) => {
    setDeletedImageIds((prev) => [...prev, imageId])
  }

  const handleRemovePending = (rowId: string, slotIndex: number) => {
    setPendingSlots((prev) => {
      const next = new Map(prev)
      const rowSlots = next.get(rowId)
      if (rowSlots) {
        const pending = rowSlots.get(slotIndex)
        if (pending) URL.revokeObjectURL(pending.previewUrl)
        rowSlots.delete(slotIndex)
        if (rowSlots.size === 0) next.delete(rowId)
        else next.set(rowId, new Map(rowSlots))
      }
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Collect all pending files
      const allPending: { rowId: string; slotIndex: number; pending: PendingSlot }[] = []
      pendingSlots.forEach((rowSlots, rowId) => {
        rowSlots.forEach((pending, slotIndex) => {
          allPending.push({ rowId, slotIndex, pending })
        })
      })

      // 2. Upload pending files
      if (allPending.length > 0) {
        setSaveProgress(`Uploading 0/${allPending.length}...`)
      }

      for (let i = 0; i < allPending.length; i++) {
        const { rowId, slotIndex, pending } = allPending[i]
        setSaveProgress(`Uploading ${i + 1}/${allPending.length}...`)

        const result = await uploadFile(pending.file, '/api/upload/gallery')

        // Create DB record
        const imageRes = await fetch('/api/gallery/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imagePath: result.url,
            publicId: result.publicId,
            order: slotIndex,
            artistId: pending.artistId,
            rowId,
          }),
        })

        if (!imageRes.ok) {
          const err = await imageRes.json()
          throw new Error(err.error || 'Failed to save image record')
        }

        URL.revokeObjectURL(pending.previewUrl)
      }

      // 3. Delete removed images
      if (deletedImageIds.length > 0) {
        setSaveProgress('Removing deleted images...')
      }
      for (const imageId of deletedImageIds) {
        try {
          await fetch('/api/gallery/images', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: imageId }),
          })
        } catch {
          console.warn(`Failed to delete image ${imageId}`)
        }
      }

      // 4. Refresh rows and clear pending state
      const rowsRes = await fetch('/api/gallery/rows')
      if (rowsRes.ok) {
        const rowsData: GalleryRow[] = await rowsRes.json()
        setRows(rowsData)
      }
      setPendingSlots(new Map())
      setDeletedImageIds([])

      toast.success('Gallery saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      const message = error instanceof Error ? error.message : 'Failed to save gallery'
      toast.error(message)
    } finally {
      setSaving(false)
      setSaveProgress('')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading gallery data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Artist Management */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Artists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={newArtistName}
              onChange={(e) => setNewArtistName(e.target.value)}
              placeholder="Artist name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleAddArtist()
              }}
            />
            <Button onClick={handleAddArtist} disabled={addingArtist || !newArtistName.trim()}>
              {addingArtist ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          {artists.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                >
                  <span>{artist.name}</span>
                  <button
                    onClick={() => void handleDeleteArtist(artist.id)}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gallery Rows</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleAddRow('THREE_COL')}
                disabled={addingRow}
              >
                <Plus className="mr-1 h-4 w-4" />
                3-Column Row
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleAddRow('FIVE_COL')}
                disabled={addingRow}
              >
                <Plus className="mr-1 h-4 w-4" />
                5-Column Row
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.length === 0 && (
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                No gallery rows yet. Add a row to get started.
              </p>
            </div>
          )}

          {rows.map((row) => {
            const maxImages = row.layout === 'THREE_COL' ? 3 : 5
            const rowPending = pendingSlots.get(row.id)
            const rowArtistId = rowArtistIds[row.id] ?? ''
            const rowArtistName = artists.find((a) => a.id === rowArtistId)?.name ?? null
            const slots = Array.from({ length: maxImages }, (_, i) => {
              // Check if this existing image is marked for deletion
              const existingImage = row.images.find((img) => img.order === i)
              if (existingImage && deletedImageIds.includes(existingImage.id)) {
                return { type: 'deleted' as const, existing: existingImage }
              }
              // Check if there's a pending image for this slot
              const pending = rowPending?.get(i)
              if (pending) {
                return { type: 'pending' as const, pending, existing: existingImage ?? null }
              }
              if (existingImage) {
                return { type: 'existing' as const, existing: existingImage }
              }
              return { type: 'empty' as const }
            })

            return (
              <Card key={row.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">
                        {row.layout === 'THREE_COL' ? '3-Column' : '5-Column'} Row (Order:{' '}
                        {row.order})
                      </CardTitle>
                      <Select
                        value={rowArtistId}
                        onValueChange={(value) =>
                          setRowArtistIds((prev) => ({ ...prev, [row.id]: value }))
                        }
                      >
                        <SelectTrigger className="h-8 w-[180px] text-xs">
                          <SelectValue placeholder="Select artist" />
                        </SelectTrigger>
                        <SelectContent>
                          {artists.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void handleDeleteRow(row.id)}
                      disabled={deletingRows[row.id]}
                    >
                      {deletingRows[row.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`grid gap-3 ${row.layout === 'THREE_COL' ? 'grid-cols-3' : 'grid-cols-5'}`}
                  >
                    {slots.map((slot, slotIndex) => (
                      <ImageSlotComponent
                        key={`${row.id}-${slotIndex}`}
                        slot={slot}
                        rowId={row.id}
                        slotIndex={slotIndex}
                        rowArtistId={rowArtistId}
                        rowArtistName={rowArtistName}
                        onFileSelect={handleFileSelect}
                        onRemoveExisting={handleRemoveImage}
                        onRemovePending={handleRemovePending}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

type SlotState =
  | { type: 'empty' }
  | { type: 'existing'; existing: GalleryImage }
  | { type: 'pending'; pending: PendingSlot; existing: GalleryImage | null }
  | { type: 'deleted'; existing: GalleryImage }

function ImageSlotComponent({
  slot,
  rowId,
  slotIndex,
  rowArtistId,
  rowArtistName,
  onFileSelect,
  onRemoveExisting,
  onRemovePending,
}: {
  slot: SlotState
  rowId: string
  slotIndex: number
  rowArtistId: string
  rowArtistName: string | null
  onFileSelect: (
    file: File,
    previewUrl: string,
    rowId: string,
    slotIndex: number,
    artistId: string
  ) => void
  onRemoveExisting: (imageId: string) => void
  onRemovePending: (rowId: string, slotIndex: number) => void
}) {
  if (slot.type === 'deleted') {
    return (
      <div className="space-y-2">
        <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-red-300 bg-red-50">
          <span className="text-xs text-red-400">Will be removed</span>
        </div>
      </div>
    )
  }

  const imageUrl =
    slot.type === 'existing'
      ? slot.existing.imagePath
      : slot.type === 'pending'
        ? slot.pending.previewUrl
        : null
  const isPending = slot.type === 'pending'
  const hasImage = slot.type === 'existing' || slot.type === 'pending'

  return (
    <div className="space-y-2">
      <ImageUploadSlot
        imageUrl={imageUrl}
        onFileSelect={(file, previewUrl) => {
          if (!rowArtistId) {
            toast.error('Please select an artist for this row first')
            URL.revokeObjectURL(previewUrl)
            return
          }
          onFileSelect(file, previewUrl, rowId, slotIndex, rowArtistId)
        }}
        onRemove={
          hasImage
            ? () => {
                if (slot.type === 'existing') {
                  onRemoveExisting(slot.existing.id)
                } else if (slot.type === 'pending') {
                  onRemovePending(rowId, slotIndex)
                }
              }
            : undefined
        }
        slotId={`${rowId}-${slotIndex}`}
        label={`Slot ${slotIndex + 1}`}
        altText={rowArtistName || 'Gallery image'}
        aspectRatio="aspect-square"
        showRemoveButton={hasImage}
        disabled={!hasImage && !rowArtistId}
        disabledMessage="Select an artist for this row before uploading"
        isPending={isPending}
      />
    </div>
  )
}
