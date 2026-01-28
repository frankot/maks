'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import type { HeroContent } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HeroCms() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [imagePairs, setImagePairs] = useState<
    Array<{
      image1: { url: string; publicId: string } | null;
      image2: { url: string; publicId: string } | null;
    }>
  >([]);
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
          const pairs: Array<{
            image1: { url: string; publicId: string } | null;
            image2: { url: string; publicId: string } | null;
          }> = [];
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, pairIndex: number, imageSlot: 'image1' | 'image2') => {
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

      const data: { url: string; publicId: string } = await response.json();

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
    setImagePairs([...imagePairs, { image1: null, image2: null }]);
  };

  const removePair = (index: number) => {
    setImagePairs((prev) => prev.filter((_, i) => i !== index));
  };

  const saveHeroContent = async () => {
    setSaving(true);

    try {
      // Flatten pairs to arrays
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

      const payload = {
        imagePaths,
        imagePublicIds,
      };

      const url = heroContent ? '/api/hero' : '/api/hero';
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
        <div className="text-lg">Loading hero content...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Pairs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Image Pairs</Label>
              <Button onClick={addNewPair} type="button" variant="outline" size="sm">
                + Add Pair
              </Button>
            </div>

            {imagePairs.map((pair, pairIndex) => (
              <Card key={pairIndex} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Pair {pairIndex + 1}</CardTitle>
                    <Button
                      onClick={() => removePair(pairIndex)}
                      variant="destructive"
                      size="sm"
                      type="button"
                    >
                      Remove
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {/* Image 1 */}
                  <div className="space-y-2">
                    <Label>Image 1</Label>
                    {pair.image1 ? (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border">
                        <Image
                          src={pair.image1.url}
                          alt="Hero Image 1"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border-2 border-dashed">
                        {uploadingSlots[`${pairIndex}-image1`] ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <span className="text-sm text-muted-foreground">No image</span>
                        )}
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFileUpload(file, pairIndex, 'image1');
                      }}
                      disabled={uploadingSlots[`${pairIndex}-image1`]}
                    />
                  </div>

                  {/* Image 2 */}
                  <div className="space-y-2">
                    <Label>Image 2</Label>
                    {pair.image2 ? (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border">
                        <Image
                          src={pair.image2.url}
                          alt="Hero Image 2"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border-2 border-dashed">
                        {uploadingSlots[`${pairIndex}-image2`] ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <span className="text-sm text-muted-foreground">No image</span>
                        )}
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFileUpload(file, pairIndex, 'image2');
                      }}
                      disabled={uploadingSlots[`${pairIndex}-image2`]}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {imagePairs.length === 0 && (
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <p className="text-muted-foreground">No image pairs added yet</p>
                <Button onClick={addNewPair} variant="outline" className="mt-4" type="button">
                  Add First Pair
                </Button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveHeroContent} disabled={saving || Object.keys(uploadingSlots).length > 0}>
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
