// src/lib/errorHandler.ts
import { NextResponse } from 'next/server'

export function errorHandler(error: unknown) {
  console.error('API error:', error)

  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
