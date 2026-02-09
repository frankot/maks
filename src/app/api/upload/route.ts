import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only image files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with optimizations
    const uploadResult = await new Promise<{
      public_id: string;
      secure_url: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'maks',
            transformation: [
              { width: 2000, height: 2000, crop: 'limit' }, // Max dimensions for product images
              { quality: 'auto:best' }, // Auto quality with best setting
              { fetch_format: 'auto' }, // Automatically deliver best format (webp for modern browsers)
            ],
            format: 'webp', // Force WebP format
            quality: 85, // Good balance between quality and file size
            secure: true,
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
              });
            } else {
              reject(new Error('Upload failed'));
            }
          }
        )
        .end(buffer);
    });

    // Check if the image is larger than 2MB and re-upload with lower quality if needed
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
    if (uploadResult.bytes > maxSizeBytes) {
      console.log(
        `Image too large (${(uploadResult.bytes / 1024 / 1024).toFixed(2)}MB), re-optimizing...`
      );

      // Delete the oversized image
      await cloudinary.uploader.destroy(uploadResult.public_id);

      // Re-upload with more aggressive compression
      const reuploadResult = await new Promise<{
        public_id: string;
        secure_url: string;
        width: number;
        height: number;
        format: string;
        bytes: number;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: 'image',
              folder: 'maks',
              transformation: [
                { width: 1600, height: 1600, crop: 'limit' }, // Slightly smaller max dimensions
                { quality: 'auto:good' }, // Lower quality preset
              ],
              format: 'webp',
              quality: 70, // More aggressive compression
              secure: true,
            },
            (error, result) => {
              if (error) reject(error);
              else if (result) {
                resolve({
                  public_id: result.public_id,
                  secure_url: result.secure_url,
                  width: result.width,
                  height: result.height,
                  format: result.format,
                  bytes: result.bytes,
                });
              } else {
                reject(new Error('Re-upload failed'));
              }
            }
          )
          .end(buffer);
      });

      return NextResponse.json({
        publicId: reuploadResult.public_id,
        url: reuploadResult.secure_url,
        width: reuploadResult.width,
        height: reuploadResult.height,
        format: reuploadResult.format,
        sizeInMB: (reuploadResult.bytes / 1024 / 1024).toFixed(2),
        optimized: true,
      });
    }

    return NextResponse.json({
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      sizeInMB: (uploadResult.bytes / 1024 / 1024).toFixed(2),
      optimized: false,
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Check if it's a Cloudinary file size error
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as { message: string }).message;
      if (errorMessage.includes('File size too large')) {
        return NextResponse.json(
          {
            error:
              'Image file is too large. Please compress the image before uploading (max 10MB).',
            type: 'file_too_large',
          },
          { status: 413 }
        );
      }
    }

    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: 'No public ID provided' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
