import type { CloudinaryImage } from './types/image'

export interface UploadResult extends CloudinaryImage {
  url: string
  publicId: string
  width: number
  height: number
  format: string
}

export async function uploadFile(file: File, endpoint: string): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(endpoint, {
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

  return response.json()
}

export async function uploadFiles(
  files: File[],
  endpoint: string,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], endpoint)
    results.push(result)
    onProgress?.(i + 1, files.length)
  }

  return results
}

export async function deleteCloudinaryImage(
  publicId: string,
  endpoint: string
): Promise<void> {
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  })

  if (!response.ok) {
    throw new Error('Failed to delete image')
  }
}
