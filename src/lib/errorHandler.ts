// src/lib/errorHandler.ts
import { NextResponse } from 'next/server';

export function errorHandler(error: unknown) {
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
}
