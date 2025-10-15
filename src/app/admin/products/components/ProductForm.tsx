'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Upload, Loader2 } from 'lucide-react';
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

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    priceInGrosz: '',
    priceInCents: '',
    description: '',
    isAvailable: false,
  });

  const isEditing = Boolean(productId);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (response.ok) {
            const product = await response.json();
            setFormData({
              name: product.name,
              priceInGrosz: (product.priceInGrosz / 100).toString(),
              priceInCents: (product.priceInCents / 100).toString(),
              description: product.description,
              isAvailable: product.isAvailable,
            });

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding this file would exceed the limit
    if (images.length + uploadingImages.length >= 4) {
      alert('Maximum 4 images allowed');
      return;
    }

    const file = files[0]; // Only take the first file
    const fileId = `${Date.now()}`;

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
        name: formData.name,
        priceInGrosz: Math.round(parseFloat(formData.priceInGrosz) * 100),
        priceInCents: Math.round(parseFloat(formData.priceInCents) * 100),
        description: formData.description,
        isAvailable: formData.isAvailable,
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
        <div className="flex items-center justify-between">
          <Label>Product Images</Label>
          <span className="text-sm text-gray-500">
            Max 4 images • First image will be the main photo
          </span>
        </div>

        {/* Hidden file input */}
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />

        {/* Image Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Existing Images */}
          {images.map((image, index) => (
            <div key={image.publicId} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200">
                <Image
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />

                {/* Number Badge */}
                <div className="absolute top-2 left-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white shadow-lg">
                  {index + 1}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleImageDelete(image.publicId)}
                  className="absolute top-2 right-2 z-20 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Loading placeholders */}
          {uploadingImages.map((fileId, index) => (
            <div
              key={fileId}
              className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>

              {/* Number Badge for loading */}
              <div className="absolute top-2 left-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-sm font-medium text-white shadow-lg">
                {images.length + index + 1}
              </div>
            </div>
          ))}

          {/* Add Photo Button - Only show if less than 4 photos total */}
          {images.length + uploadingImages.length < 4 && (
            <Label
              htmlFor="image-upload"
              className="relative flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100"
            >
              <div className="text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">Add Photo</span>
              </div>
            </Label>
          )}
        </div>
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
