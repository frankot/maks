'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

interface ImageUploadSlotProps {
  imageUrl?: string | null
  onFileSelect: (file: File, previewUrl: string) => void
  onRemove?: () => void
  slotId: string
  label?: string
  altText?: string
  aspectRatio?: string
  showRemoveButton?: boolean
  disabled?: boolean
  isPending?: boolean
  maxFileSize?: number
}

export default function ImageUploadSlot({
  imageUrl,
  onFileSelect,
  onRemove,
  slotId,
  label,
  altText = 'Uploaded image',
  aspectRatio = 'aspect-[4/3]',
  showRemoveButton = true,
  disabled = false,
  isPending = false,
  maxFileSize = MAX_FILE_SIZE,
}: ImageUploadSlotProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const validateImage = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size must be less than ${maxFileSize / (1024 * 1024)}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type not supported. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
    }
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `File extension not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    }
    return null
  }

  const handleFile = (file: File) => {
    if (disabled) return

    const error = validateImage(file)
    if (error) {
      toast.error(error)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    onFileSelect(file, previewUrl)
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

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file && file.type.startsWith('image/')) {
        handleFile(file)
      } else {
        toast.error('Please drop an image file')
      }
    }
  }

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div
          className={`group relative ${aspectRatio} bg-muted overflow-hidden rounded-lg border transition-all ${
            isPending ? 'border-dashed border-amber-400' : ''
          } ${isDraggingOver ? 'border-primary ring-primary/20 border-2 ring-2' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-cover"
            unoptimized
          />
          {isPending && (
            <div className="absolute top-2 left-2 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              Unsaved
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
                    if (file) handleFile(file)
                    e.target.value = ''
                  }}
                  disabled={disabled}
                  className="hidden"
                  aria-label={`Replace ${label || 'image'}`}
                />
              </label>
            </div>
          )}
          {showRemoveButton && onRemove && !disabled && (
            <button
              onClick={onRemove}
              type="button"
              aria-label={`Remove ${label || 'image'}`}
              className="bg-destructive hover:bg-destructive/90 absolute top-2 right-2 rounded p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
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
          {isDraggingOver && !disabled ? (
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
                JPG, PNG, WebP (max {maxFileSize / (1024 * 1024)}MB)
              </span>
            </div>
          )}
          <input
            id={`upload-${slotId}`}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
            disabled={disabled}
            className="hidden"
            aria-label={`Upload ${label || 'image'}`}
          />
        </label>
      )}
    </div>
  )
}
