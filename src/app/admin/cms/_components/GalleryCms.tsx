'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoArtist {
  id: string;
  name: string;
}

interface GalleryImage {
  id: string;
  imagePath: string;
  publicId: string;
  order: number;
  artistId: string;
  artist: PhotoArtist;
}

interface GalleryRow {
  id: string;
  layout: 'THREE_COL' | 'FIVE_COL';
  order: number;
  images: GalleryImage[];
}

export default function GalleryCms() {
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [artists, setArtists] = useState<PhotoArtist[]>([]);
  const [newArtistName, setNewArtistName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addingArtist, setAddingArtist] = useState(false);
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});
  const [deletingRows, setDeletingRows] = useState<Record<string, boolean>>({});
  const [deletingImages, setDeletingImages] = useState<Record<string, boolean>>({});
  const [addingRow, setAddingRow] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rowsRes, artistsRes] = await Promise.all([
        fetch('/api/gallery/rows'),
        fetch('/api/photo-artists'),
      ]);

      if (rowsRes.ok) {
        const rowsData: GalleryRow[] = await rowsRes.json();
        setRows(rowsData);
      }
      if (artistsRes.ok) {
        const artistsData: PhotoArtist[] = await artistsRes.json();
        setArtists(artistsData);
      }
    } catch {
      toast.error('Failed to load gallery data');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Artist Management ---
  const handleAddArtist = async () => {
    if (!newArtistName.trim()) return;
    setAddingArtist(true);
    try {
      const res = await fetch('/api/photo-artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newArtistName.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to add artist');
        return;
      }

      const artist: PhotoArtist = await res.json();
      setArtists((prev) => [...prev, artist].sort((a, b) => a.name.localeCompare(b.name)));
      setNewArtistName('');
      toast.success('Artist added');
    } catch {
      toast.error('Failed to add artist');
    } finally {
      setAddingArtist(false);
    }
  };

  const handleDeleteArtist = async (id: string) => {
    try {
      const res = await fetch('/api/photo-artists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete artist');
        return;
      }

      setArtists((prev) => prev.filter((a) => a.id !== id));
      toast.success('Artist deleted');
    } catch {
      toast.error('Failed to delete artist');
    }
  };

  // --- Row Management ---
  const handleAddRow = async (layout: 'THREE_COL' | 'FIVE_COL') => {
    setAddingRow(true);
    try {
      const order = rows.length;
      const res = await fetch('/api/gallery/rows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, order }),
      });

      if (!res.ok) throw new Error('Failed to create row');

      const row: GalleryRow = await res.json();
      setRows((prev) => [...prev, { ...row, images: [] }]);
      toast.success(`Added ${layout === 'THREE_COL' ? '3-column' : '5-column'} row`);
    } catch {
      toast.error('Failed to add row');
    } finally {
      setAddingRow(false);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    setDeletingRows((prev) => ({ ...prev, [rowId]: true }));
    try {
      const res = await fetch('/api/gallery/rows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rowId }),
      });

      if (!res.ok) throw new Error('Failed to delete row');

      setRows((prev) => prev.filter((r) => r.id !== rowId));
      toast.success('Row deleted');
    } catch {
      toast.error('Failed to delete row');
    } finally {
      setDeletingRows((prev) => {
        const newState = { ...prev };
        delete newState[rowId];
        return newState;
      });
    }
  };

  // --- Image Management ---
  const handleUploadImage = async (
    file: File,
    rowId: string,
    slotIndex: number,
    artistId: string
  ) => {
    const slotKey = `${rowId}-${slotIndex}`;
    setUploadingSlots((prev) => ({ ...prev, [slotKey]: true }));

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload/gallery', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        toast.error(err.error || 'Upload failed');
        return;
      }

      const uploadData: { url: string; publicId: string } = await uploadRes.json();

      // Create gallery image record
      const imageRes = await fetch('/api/gallery/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePath: uploadData.url,
          publicId: uploadData.publicId,
          order: slotIndex,
          artistId,
          rowId,
        }),
      });

      if (!imageRes.ok) throw new Error('Failed to save image record');

      // Refresh rows
      const rowsRes = await fetch('/api/gallery/rows');
      if (rowsRes.ok) {
        const rowsData: GalleryRow[] = await rowsRes.json();
        setRows(rowsData);
      }

      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingSlots((prev) => {
        const newState = { ...prev };
        delete newState[slotKey];
        return newState;
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    setDeletingImages((prev) => ({ ...prev, [imageId]: true }));
    try {
      const res = await fetch('/api/gallery/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId }),
      });

      if (!res.ok) throw new Error('Failed to delete image');

      // Refresh rows
      const rowsRes = await fetch('/api/gallery/rows');
      if (rowsRes.ok) {
        const rowsData: GalleryRow[] = await rowsRes.json();
        setRows(rowsData);
      }

      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeletingImages((prev) => {
        const newState = { ...prev };
        delete newState[imageId];
        return newState;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading gallery data...</div>
      </div>
    );
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
                if (e.key === 'Enter') void handleAddArtist();
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
              <p className="text-muted-foreground">No gallery rows yet. Add a row to get started.</p>
            </div>
          )}

          {rows.map((row) => {
            const maxImages = row.layout === 'THREE_COL' ? 3 : 5;
            const slots = Array.from({ length: maxImages }, (_, i) => {
              return row.images.find((img) => img.order === i) ?? null;
            });

            return (
              <Card key={row.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {row.layout === 'THREE_COL' ? '3-Column' : '5-Column'} Row (Order:{' '}
                      {row.order})
                    </CardTitle>
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
                    {slots.map((image, slotIndex) => (
                      <ImageSlot
                        key={`${row.id}-${slotIndex}`}
                        image={image}
                        rowId={row.id}
                        slotIndex={slotIndex}
                        artists={artists}
                        uploading={!!uploadingSlots[`${row.id}-${slotIndex}`]}
                        deleting={image ? !!deletingImages[image.id] : false}
                        onUpload={handleUploadImage}
                        onDelete={handleDeleteImage}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function ImageSlot({
  image,
  rowId,
  slotIndex,
  artists,
  uploading,
  deleting,
  onUpload,
  onDelete,
}: {
  image: GalleryImage | null;
  rowId: string;
  slotIndex: number;
  artists: PhotoArtist[];
  uploading: boolean;
  deleting: boolean;
  onUpload: (file: File, rowId: string, slotIndex: number, artistId: string) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
}) {
  const [selectedArtistId, setSelectedArtistId] = useState(artists[0]?.id ?? '');

  if (image) {
    return (
      <div className="space-y-1">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
          <Image
            src={image.imagePath}
            alt={image.artist.name}
            fill
            className="object-cover"
            unoptimized
          />
          <button
            onClick={() => void onDelete(image.id)}
            disabled={deleting}
            className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            {deleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </button>
        </div>
        <p className="text-muted-foreground truncate text-xs">{image.artist.name}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed">
        {uploading ? (
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        ) : (
          <span className="text-muted-foreground text-xs">Empty</span>
        )}
      </div>
      {artists.length > 0 && (
        <>
          <Select value={selectedArtistId} onValueChange={setSelectedArtistId}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Artist" />
            </SelectTrigger>
            <SelectContent>
              {artists.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label className="block">
            <Input
              type="file"
              accept="image/*"
              className="h-7 text-xs"
              disabled={uploading || !selectedArtistId}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && selectedArtistId) {
                  void onUpload(file, rowId, slotIndex, selectedArtistId);
                }
              }}
            />
          </Label>
        </>
      )}
      {artists.length === 0 && (
        <p className="text-xs text-red-500">Add an artist first</p>
      )}
    </div>
  );
}
