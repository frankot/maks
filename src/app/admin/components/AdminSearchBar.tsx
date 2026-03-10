import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AdminSearchBarProps {
  basePath: string
  searchQuery?: string
  placeholder?: string
}

export function AdminSearchBar({ basePath, searchQuery, placeholder = 'Search…' }: AdminSearchBarProps) {
  return (
    <form action={basePath} method="get" className="flex flex-1 gap-2">
      <Input
        name="q"
        defaultValue={searchQuery ?? ''}
        placeholder={placeholder}
        aria-label={placeholder}
        className="max-w-md"
      />
      <Button type="submit" variant="outline">
        Search
      </Button>
      {searchQuery ? (
        <Button asChild variant="ghost">
          <Link href={basePath}>Clear</Link>
        </Button>
      ) : null}
    </form>
  )
}
