'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Settings, RefreshCw, Trash2, Plus } from 'lucide-react'

interface Collection {
  id: string
  name: string
  slug: string
}

interface EditCollectionsProps {
  onCollectionsChanged?: () => void
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function EditCollections({ onCollectionsChanged }: EditCollectionsProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null)

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

  useEffect(() => {
    if (open) {
      fetchCollections()
    }
  }, [open])

  const handleNameChange = (value: string) => {
    setName(value)
    if (!isSlugManuallyEdited && value) {
      setSlug(generateSlug(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlug(value)
    setIsSlugManuallyEdited(true)
  }

  const handleRegenerateSlug = () => {
    if (name) {
      setSlug(generateSlug(name))
      setIsSlugManuallyEdited(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
        }),
      })

      if (response.ok) {
        setName('')
        setSlug('')
        setIsSlugManuallyEdited(false)
        await fetchCollections()
        if (onCollectionsChanged) {
          onCollectionsChanged()
        }
      } else {
        const errorData = await response.json()
        console.error('Error creating collection:', errorData.error)
      }
    } catch (error) {
      console.error('Error creating collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (collection: Collection) => {
    setCollectionToDelete(collection)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete) return

    setLoading(true)
    try {
      const response = await fetch(`/api/collections/${collectionToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCollections()
        if (onCollectionsChanged) {
          onCollectionsChanged()
        }
      } else {
        const errorData = await response.json()
        console.error('Error deleting collection:', errorData.error)
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
    } finally {
      setLoading(false)
      setDeleteConfirmOpen(false)
      setCollectionToDelete(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Manage Collections
          </Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[80vh] flex-col px-6 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Collections</DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto">
            {/* Existing Collections */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Current Collections</h3>
              {collections.length === 0 ? (
                <p className="py-2 text-sm text-gray-500">No collections yet. Add one below.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center justify-between rounded border px-2 py-1.5 text-xs transition-colors hover:bg-gray-50"
                    >
                      <div className="mr-2 min-w-0 flex-1">
                        <p className="truncate font-medium">{collection.name}</p>
                        <p className="truncate text-gray-500">/{collection.slug}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(collection)}
                        disabled={loading}
                        className="h-6 w-6 flex-shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Collection */}
            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Add New Collection</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collection-name">Collection Name</Label>
                  <Input
                    id="collection-name"
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    placeholder="Enter collection name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection-slug">Slug (URL)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="collection-slug"
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      required
                      placeholder="collection-slug"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateSlug}
                      disabled={!name}
                      className="px-3"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Auto-generated from collection name. You can edit manually or regenerate.
                  </p>
                </div>

                <Button type="submit" disabled={loading || !name || !slug} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  {loading ? 'Adding...' : 'Add Collection'}
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the collection &quot;{collectionToDelete?.name}&quot;?
              This action cannot be undone. Products in this collection will not be deleted, but
              they will no longer be associated with this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete Collection'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
