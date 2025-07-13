import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (9MB limit)
    const maxSize = 9 * 1024 * 1024; // 9MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: `File size too large. Maximum size is 9MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.` 
        },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP files are allowed." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with high-res settings for hero slides
    const uploadResult = await new Promise<{
      public_id: string;
      secure_url: string;
      width: number;
      height: number;
      format: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "maks/hero",
            transformation: [
              { width: 1920, height: 1080, crop: "limit" }, // Full HD limit
              { quality: "auto:best" }, // Best quality
              { format: "webp" }, // Modern format for better compression
            ],
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
              });
            } else {
              reject(new Error("Upload failed"));
            }
          },
        )
        .end(buffer);
    });

    return NextResponse.json({
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error) {
    console.error("Hero upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload hero image" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "No public ID provided" },
        { status: 400 },
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hero delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete hero image" },
      { status: 500 },
    );
  }
}
