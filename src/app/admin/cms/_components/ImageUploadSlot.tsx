'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

// Image validation config
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

interface ValidationError {
  message: string
  field?: string
}

interface ImageUploadSlotProps {
  /** Current image URL (if exists) */
  imageUrl?: string | null
  /** Callback when new image is uploaded - receives the uploaded image data */
  onUpload: (data: {
    url: string
    publicId: string
  }) => Promise<{ url: string; publicId: string }> | void
  /** Callback when image is removed */
  onRemove?: () => void
  /** Upload endpoint URL */
  uploadEndpoint: string
  /** Unique identifier for this slot (for accessibility and drag state) */
  slotId: string
  /** Label for the slot (e.g., "Left", "Right", "Gallery Image") */
  label?: string
  /** Alt text for the image */
  altText?: string
  /** Aspect ratio class (default: aspect-[4/3]) */
  aspectRatio?: string
  /** Show remove button */
  showRemoveButton?: boolean
  /** Disabled state */
  disabled?: boolean
}

export default function ImageUploadSlot({
  imageUrl,
  onUpload,
  onRemove,
  uploadEndpoint,
  slotId,
  label,
  altText = 'Uploaded image',
  aspectRatio = 'aspect-[4/3]',
  showRemoveButton = true,
  disabled = false,
}: ImageUploadSlotProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [optimisticPreview, setOptimisticPreview] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const validateImage = (file: File): ValidationError | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        field: 'size',
      }
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        message: `File type not supported. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
        field: 'type',
      }
    }

    // Check file extension as backup
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        message: `File extension not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        field: 'extension',
      }
    }

    return null
  }

  const handleFileUpload = async (file: File) => {
    if (disabled) return

    // Validate image before upload
    const validationError = validateImage(file)
    if (validationError) {
      toast.error(validationError.message)
      return
    }

    // Create optimistic preview
    const previewUrl = URL.createObjectURL(file)
    setOptimisticPreview(previewUrl)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        try {
          const error = await response.json()
          errorMessage = error.error || error.message || errorMessage
        } catch {
          errorMessage = `Upload failed with status ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      await onUpload(data)

      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Failed to upload image'
      toast.error(message)
    } finally {
      // Cleanup optimistic preview
      if (optimisticPreview) {
        URL.revokeObjectURL(optimisticPreview)
        setOptimisticPreview(null)
      }
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file && file.type.startsWith('image/')) {
        await handleFileUpload(file)
      } else {
        toast.error('Please drop an image file')
      }
    }
  }

  const displayImage = optimisticPreview || imageUrl

  return (
    <div className="space-y-2">
      {displayImage ? (
        <div
          className={`group relative ${aspectRatio} bg-muted overflow-hidden rounded-lg border transition-all ${
            isDraggingOver ? 'border-primary ring-primary/20 border-2 ring-2' : ''
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Image
            src={displayImage}
            alt={altText}
            fill
            className={`object-cover transition-opacity ${
              isUploading ? 'opacity-50' : 'opacity-100'
            }`}
            unoptimized
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          {isDraggingOver && !disabled && (
            <div className="bg-primary/10 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <Upload className="text-primary mx-auto mb-2 h-8 w-8" />
                <span className="text-primary text-sm font-medium">Drop to replace</span>
              </div>
            </div>
          )}
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <label className="cursor-pointer" htmlFor={`upload-${slotId}`}>
                <Upload className="h-6 w-6 text-white" />
                <span className="sr-only">Replace {label || 'image'}</span>
                <input
                  id={`upload-${slotId}`}
                  type="file"
                  accept={ALLOWED_EXTENSIONS.join(',')}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleFileUpload(file)
                  }}
                  disabled={isUploading || disabled}
                  className="hidden"
                  aria-label={`Replace ${label || 'image'}`}
                />
              </label>
            </div>
          )}
          {showRemoveButton && onRemove && !disabled && (
            <button
              onClick={onRemove}
              disabled={isUploading}
              aria-label={`Remove ${label || 'image'}`}
              className="bg-destructive hover:bg-destructive/90 absolute top-2 right-2 rounded p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={`upload-${slotId}`}
          className={`flex ${aspectRatio} cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all ${
            isDraggingOver
              ? 'border-primary bg-primary/5 ring-primary/20 ring-2'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 focus-within:border-muted-foreground/50 focus-within:bg-muted/50'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="text-center">
              <Loader2 className="text-muted-foreground mx-auto mb-2 h-6 w-6 animate-spin" />
              <span className="text-muted-foreground text-sm">Uploading...</span>
            </div>
          ) : isDraggingOver && !disabled ? (
            <div className="text-center">
              <Upload className="text-primary mx-auto mb-2 h-8 w-8" />
              <span className="text-primary text-sm font-medium">Drop image here</span>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="text-muted-foreground mx-auto mb-2 h-6 w-6" />
              <span className="text-muted-foreground text-sm">
                Click or drag to upload {label ? `${label.toLowerCase()} image` : 'image'}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs">
                JPG, PNG, WebP (max 5MB)
              </span>
            </div>
          )}
          <input
            id={`upload-${slotId}`}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFileUpload(file)
            }}
            disabled={isUploading || disabled}
            className="hidden"
            aria-label={`Upload ${label || 'image'}`}
          />
        </label>
      )}
    </div>
  )
}
