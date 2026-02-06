'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import type { HeroContent } from '@prisma/client';
import { Loader2, Upload, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ImageSlot {
  url: string;
  publicId: string;
}

interface ImagePair {
  image1: ImageSlot | null;
  image2: ImageSlot | null;
}

export default function HeroCms() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([]);
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const response = await fetch('/api/hero');
      if (response.ok) {
        const data: HeroContent | null = await response.json();

        if (data) {
          setHeroContent(data);

          // Convert flat arrays to pairs
          const pairs: ImagePair[] = [];
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
            });
          }
          setImagePairs(pairs);
        }
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
      toast.error('Failed to load hero content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    pairIndex: number,
    imageSlot: 'image1' | 'image2'
  ) => {
    const slotKey = `${pairIndex}-${imageSlot}`;
    setUploadingSlots((prev) => ({ ...prev, [slotKey]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/hero', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Upload failed');
        return;
      }

      const data: ImageSlot = await response.json();

      setImagePairs((prev) => {
        const newPairs = [...prev];
        if (!newPairs[pairIndex]) {
          newPairs[pairIndex] = { image1: null, image2: null };
        }
        newPairs[pairIndex]![imageSlot] = data;
        return newPairs;
      });

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingSlots((prev) => {
        const newState = { ...prev };
        delete newState[slotKey];
        return newState;
      });
    }
  };

  const addNewPair = () => {
    setImagePairs([{ image1: null, image2: null }, ...imagePairs]);
  };

  const removePair = (index: number) => {
    setImagePairs((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (pairIndex: number, slot: 'image1' | 'image2') => {
    setImagePairs((prev) => {
      const newPairs = [...prev];
      newPairs[pairIndex]![slot] = null;
      return newPairs;
    });
  };

  const saveHeroContent = async () => {
    setSaving(true);

    try {
      const imagePaths: string[] = [];
      const imagePublicIds: string[] = [];

      imagePairs.forEach((pair) => {
        if (pair.image1) {
          imagePaths.push(pair.image1.url);
          imagePublicIds.push(pair.image1.publicId);
        }
        if (pair.image2) {
          imagePaths.push(pair.image2.url);
          imagePublicIds.push(pair.image2.publicId);
        }
      });

      const payload = { imagePaths, imagePublicIds };
      const url = '/api/hero';
      const method = heroContent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroContent ? { ...payload, id: heroContent.id } : payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save hero content');
      }

      const savedContent: HeroContent = await response.json();
      setHeroContent(savedContent);
      toast.success('Hero content saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save hero content');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
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
            <Button onClick={addNewPair} type="button" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Pair
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {imagePairs.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
              <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
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
                  className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
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
                      const image = pair[slot];
                      const slotKey = `${pairIndex}-${slot}`;
                      const isUploading = uploadingSlots[slotKey];

                      return (
                        <div key={slot} className="space-y-2">
                          {image ? (
                            <div className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                              <Image
                                src={image.url}
                                alt={`Hero ${slot === 'image1' ? 'Left' : 'Right'}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <label className="cursor-pointer">
                                  <Upload className="h-6 w-6 text-white" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) void handleFileUpload(file, pairIndex, slot);
                                    }}
                                    disabled={isUploading}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              <button
                                onClick={() => removeImage(pairIndex, slot)}
                                className="absolute right-2 top-2 rounded bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex aspect-[4/3] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
                              {isUploading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              ) : (
                                <div className="text-center">
                                  <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                                  <span className="text-muted-foreground text-sm">
                                    Click to upload
                                  </span>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) void handleFileUpload(file, pairIndex, slot);
                                }}
                                disabled={isUploading}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end border-t pt-6">
            <Button
              onClick={saveHeroContent}
              disabled={saving || Object.keys(uploadingSlots).length > 0}
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Hero Content'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
