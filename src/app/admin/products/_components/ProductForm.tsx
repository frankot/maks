'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Category } from '@/app/generated/prisma';
import { Switch } from '@/components/ui/switch';
import { X, Upload, Loader2, Link2, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

interface UploadedImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

// Function to generate URL-friendly ID from product name
function generateProductId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
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
    collectionId: '',
  });
  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(false);

  const isEditing = Boolean(productId);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (response.ok) {
            const product = await response.json();
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
              collectionId: product.collectionId || '',
            });
            setIsIdManuallyEdited(true); // Existing product ID should not auto-update

            // Load existing images
            if (product.imagePublicIds && product.imagePaths) {
              const existingImages = product.imagePublicIds.map(
                (publicId: string, index: number) => ({
                  publicId,
                  url: product.imagePaths[index],
                  width: 800,
                  height: 800,
                  format: 'webp',
                })
              );
              setImages(existingImages);
            }
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections');
        if (response.ok) {
          const data = await response.json();
          setCollections(data);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };
    fetchCollections();
  }, []);

  // Auto-generate ID from name when name changes (only for new products or when not manually edited)
  useEffect(() => {
    if (!isIdManuallyEdited && formData.name) {
      const generatedSlug = generateProductId(formData.name);
      // For new products set slug, for editing do not overwrite unless manually allowed
      if (!isEditing) {
        setFormData((prev) => ({ ...prev, slug: generatedSlug, id: prev.id || generatedSlug }));
      } else if (!formData.slug) {
        setFormData((prev) => ({ ...prev, slug: generatedSlug }));
      }
    }
  }, [formData.name, formData.slug, isEditing, isIdManuallyEdited]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${Date.now()}-${i}`;

      setUploadingImages((prev) => [...prev, fileId]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setImages((prev) => [...prev, result]);
        } else {
          console.error('Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploadingImages((prev) => prev.filter((id) => id !== fileId));
      }
    }

    // Reset file input
    event.target.value = '';
  };

  const handleImageDelete = async (publicId: string) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.publicId !== publicId));
      } else {
        console.error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        id: formData.id || undefined,
        slug: formData.slug || undefined,
        name: formData.name,
        priceInGrosz: Math.round(parseFloat(formData.priceInGrosz) * 100),
        priceInCents: Math.round(parseFloat(formData.priceInCents) * 100),
        description: formData.description,
        materials: formData.materials || null,
        isAvailable: formData.isAvailable,
        category: formData.category,
        collectionId: formData.collectionId || null,
        imagePaths: images.map((img) => img.url),
        imagePublicIds: images.map((img) => img.publicId),
      };

      let response;
      if (isEditing && productId) {
        response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/admin/products');
        }
      } else {
        const errorData = await response.json();
        console.error('Error saving product:', errorData.error);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };



  const handleSlugChange = (value: string) => {
    setIsIdManuallyEdited(true);
    handleInputChange('slug', value);
  };

  const handleRegenerateId = () => {
    if (formData.name) {
      const generated = generateProductId(formData.name);
      setFormData((prev) => ({ ...prev, slug: generated, id: prev.id || generated }));
      setIsIdManuallyEdited(false);
    }
  };

  const previewUrl = formData.slug ? `/shop/${formData.slug}` : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          <Label htmlFor="isAvailable">Available</Label>
          <div className="flex items-center space-x-2">
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
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value as Category)}
          >
            <option value="RINGS">Rings</option>
            <option value="NECKLACES">Necklaces</option>
            <option value="EARRINGS">Earrings</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection">Collection</Label>
          <select
            id="collection"
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
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
      </div>

      {/* Materials */}
      <div className="space-y-2">
        <Label htmlFor="materials">Materials</Label>
        <Input
          id="materials"
          type="text"
          value={formData.materials}
          onChange={(e) => handleInputChange('materials', e.target.value)}
          placeholder="e.g. 18k white gold, diamonds"
        />
        <p className="text-xs text-gray-500">
          Short materials description shown on product cards (optional).
        </p>
      </div>

      {/* Product ID Section */}
      <div className="space-y-2">
        <Label htmlFor="id">Product ID (URL)</Label>
        <div className="space-y-2">
          <div className="flex space-x-2">
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

          {/* URL Preview */}
          {previewUrl && (
            <div className="flex items-center space-x-2 rounded-md bg-gray-50 p-3">
              <Link2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Preview URL:</span>
              <code className="font-mono text-sm text-blue-600">{previewUrl}</code>
            </div>
          )}

          <p className="text-xs text-gray-500">
            {'Auto-generated from product name. You can edit it manually or regenerate.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          required
          placeholder="Enter product description"
          rows={4}
        />
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <Label>Product Images</Label>

        {/* File Input */}
        <div className="flex items-center space-x-4">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <Label
            htmlFor="image-upload"
            className="inline-flex cursor-pointer items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Images</span>
          </Label>
          <span className="text-sm text-gray-500">Select multiple images (JPG, PNG, WebP)</span>
        </div>

        {/* Image Preview Grid */}
        {(images.length > 0 || uploadingImages.length > 0) && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <div key={image.publicId} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  <Image
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleImageDelete(image.publicId)}
                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Loading placeholders */}
            {uploadingImages.map((fileId) => (
              <div
                key={fileId}
                className="relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploadingImages.length > 0}>
          {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
