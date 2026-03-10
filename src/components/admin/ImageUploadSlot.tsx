'use client'

import { useRef, useState } from 'react'
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
  disabledMessage?: string
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
  disabledMessage,
}: ImageUploadSlotProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = `upload-${slotId}`

  const handleDisabledInteraction = () => {
    if (disabledMessage) {
      toast.error(disabledMessage)
    }
  }

  const openFileDialog = () => {
    if (disabled) {
      handleDisabledInteraction()
      return
    }

    inputRef.current?.click()
  }

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
    e.preventDefault()
    e.stopPropagation()

    if (disabled) {
      setIsDraggingOver(false)
      return
    }

    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    if (disabled) {
      handleDisabledInteraction()
      return
    }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return
    }

    e.preventDefault()
    openFileDialog()
  }

  const triggerProps = {
    role: 'button' as const,
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled,
    onClick: openFileDialog,
    onKeyDown: handleKeyDown,
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
          {...triggerProps}
        >
          <Image src={imageUrl} alt={altText} fill className="object-cover" unoptimized />
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
              <div className="pointer-events-none">
                <Upload className="h-6 w-6 text-white" />
                <span className="sr-only">Replace {label || 'image'}</span>
              </div>
            </div>
          )}
          {showRemoveButton && onRemove && !disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              type="button"
              aria-label={`Remove ${label || 'image'}`}
              className="bg-destructive hover:bg-destructive/90 absolute top-2 right-2 rounded p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`flex ${aspectRatio} cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all ${
            isDraggingOver
              ? 'border-primary bg-primary/5 ring-primary/20 ring-2'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 focus-within:border-muted-foreground/50 focus-within:bg-muted/50'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          {...triggerProps}
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
              {disabledMessage && disabled && (
                <span className="mt-1 block text-xs text-amber-600">{disabledMessage}</span>
              )}
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
        disabled={disabled}
        className="hidden"
        aria-label={`${imageUrl ? 'Replace' : 'Upload'} ${label || 'image'}`}
      />
    </div>
  )
}
