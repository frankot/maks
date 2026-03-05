export interface CloudinaryImage {
  url: string
  publicId: string
  width?: number
  height?: number
  format?: string
}

export interface PendingImage {
  file: File
  previewUrl: string
}

export type SlotImage =
  | { type: 'existing'; data: CloudinaryImage }
  | { type: 'pending'; data: PendingImage }
