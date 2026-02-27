'use client'

import { ReactNode, useMemo, useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface TableColumn<T> {
  key: string
  label: string
  render: (item: T) => ReactNode
  /** Return a sortable primitive. If omitted the column is not sortable. */
  sortValue?: (item: T) => string | number | Date
  className?: string
}

type SortDir = 'asc' | 'desc'

interface AdminTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  keyExtractor: (item: T) => string
  /** Column key to sort by initially */
  defaultSortKey?: string
  defaultSortDir?: SortDir
}

export function AdminTable<T>({
  columns,
  data,
  emptyMessage = 'No data found',
  keyExtractor,
  defaultSortKey,
  defaultSortDir = 'desc',
}: AdminTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null)
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return data

    const getValue = col.sortValue
    return [...data].sort((a, b) => {
      const va = getValue(a)
      const vb = getValue(b)

      let cmp = 0
      if (typeof va === 'string' && typeof vb === 'string') {
        cmp = va.localeCompare(vb)
      } else if (va instanceof Date && vb instanceof Date) {
        cmp = va.getTime() - vb.getTime()
      } else {
        cmp = Number(va) - Number(vb)
      }

      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir, columns])

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    )
  }

  return (
    <div className="">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const isSortable = !!column.sortValue
              return (
                <TableHead
                  key={column.key}
                  className={`${column.className ?? ''} ${isSortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={isSortable ? () => handleSort(column.key) : undefined}
                >
                  {column.label}
                  {isSortable && <SortIcon colKey={column.key} />}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-8 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
