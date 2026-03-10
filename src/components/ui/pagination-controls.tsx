'use client'

import Link from 'next/link'
import { Button } from './button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationControlsProps {
  basePath: string
  nextCursor?: string
  prevCursor?: string
  hasMore: boolean
  hasPrev: boolean
  queryParams?: Record<string, string>
}

export function PaginationControls({
  basePath,
  nextCursor,
  prevCursor,
  hasMore,
  hasPrev,
  queryParams,
}: PaginationControlsProps) {
  if (!hasMore && !hasPrev) return null

  const buildHref = (pageParams?: Record<string, string>) => {
    const params = new URLSearchParams()

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value) params.set(key, value)
      }
    }

    if (pageParams) {
      for (const [key, value] of Object.entries(pageParams)) {
        if (value) params.set(key, value)
      }
    }

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      {hasPrev ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={buildHref(prevCursor ? { cursor: prevCursor, dir: 'prev' } : undefined)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
      )}

      {hasMore ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={buildHref(nextCursor ? { cursor: nextCursor } : undefined)}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
