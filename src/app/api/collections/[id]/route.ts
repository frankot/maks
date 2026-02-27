import { NextResponse } from 'next/server'
import { deleteCollection } from '@/lib/collections'
import { errorHandler } from '@/lib/errorHandler'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 })
    }

    await deleteCollection(id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return errorHandler(error)
  }
}
