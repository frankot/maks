'use client';

import Link from 'next/link';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  basePath: string;
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  hasPrev: boolean;
}

export function PaginationControls({
  basePath,
  nextCursor,
  prevCursor,
  hasMore,
  hasPrev,
}: PaginationControlsProps) {
  if (!hasMore && !hasPrev) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      {hasPrev ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={prevCursor ? `${basePath}?cursor=${prevCursor}&dir=prev` : basePath}>
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
          <Link href={`${basePath}?cursor=${nextCursor}`}>
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
  );
}
