'use client'

import Link from 'next/link'
import { Button } from './button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ADMIN_PAGE_SIZE_OPTIONS } from '@/lib/constants'

interface PaginationControlsProps {
  basePath: string
  page: number
  totalPages: number
  pageSize: number
  queryParams?: Record<string, string>
}

export function PaginationControls({
  basePath,
  page,
  totalPages,
  pageSize,
  queryParams,
}: PaginationControlsProps) {
  if (totalPages <= 1 && pageSize === ADMIN_PAGE_SIZE_OPTIONS[0]) return null

  const buildHref = (targetPage: number, targetPageSize?: number) => {
    const params = new URLSearchParams()

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value) params.set(key, value)
      }
    }

    if (targetPage > 1) params.set('page', String(targetPage))
    const size = targetPageSize ?? pageSize
    if (size !== ADMIN_PAGE_SIZE_OPTIONS[0]) params.set('pageSize', String(size))

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="flex items-center justify-between pt-4 pb-10">
      {/* Page size selector — bottom left */}
      <div className="flex items-center gap-1">
        {ADMIN_PAGE_SIZE_OPTIONS.map((size) => (
          <Button
            key={size}
            variant={size === pageSize ? 'default' : 'ghost'}
            size="sm"
            className="h-7 min-w-[2rem] px-2 text-xs"
            asChild
          >
            <Link href={buildHref(1, size)}>{size}</Link>
          </Button>
        ))}
      </div>

      {/* Prev / page info / Next — bottom right */}
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Button variant="outline" size="sm" className="h-7" asChild>
            <Link href={buildHref(page - 1)}>
              <ChevronLeft className="mr-1 h-3.5 w-3.5" />
              Prev
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="h-7" disabled>
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Prev
          </Button>
        )}

        <span className="text-muted-foreground text-xs tabular-nums">
          {page} / {totalPages}
        </span>

        {hasNext ? (
          <Button variant="outline" size="sm" className="h-7" asChild>
            <Link href={buildHref(page + 1)}>
              Next
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="h-7" disabled>
            Next
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
