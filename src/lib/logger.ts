// src/lib/logger.ts
export function logInfo(message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.info('[INFO]', message, context || '')
  }
}

export function logError(message: string, error?: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', message, error, context || '')
  }
}
