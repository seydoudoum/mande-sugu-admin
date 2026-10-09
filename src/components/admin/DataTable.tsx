import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import EmptyState from './EmptyState'
import SkeletonLoader from './SkeletonLoader'

export interface DataTableColumn<T extends { id: number }> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  render?: (value: T[keyof T], row: T) => ReactNode
}

interface DataTableProps<T extends { id: number }> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  selectable?: boolean
  onSelectionChange?: (ids: number[]) => void
  emptyMessage?: string
}

type SortDirection = 'asc' | 'desc'

function compareValues(left: unknown, right: unknown): number {
  if (left === right) return 0
  if (left === null || left === undefined) return 1
  if (right === null || right === undefined) return -1
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }
  return String(left).localeCompare(String(right), 'fr', {
    numeric: true,
    sensitivity: 'base',
  })
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  loading = false,
  onRowClick,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'Aucune donnée disponible.',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())

  const sortedData = useMemo(() => {
    if (sortKey === null) return data
    return [...data].sort((left, right) => {
      const result = compareValues(left[sortKey], right[sortKey])
      return sortDirection === 'asc' ? result : -result
    })
  }, [data, sortDirection, sortKey])

  const allSelected =
    data.length > 0 && data.every((row) => selectedIds.has(row.id))
  const someSelected = data.some((row) => selectedIds.has(row.id))

  function toggleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  function updateSelection(nextSelection: Set<number>) {
    setSelectedIds(nextSelection)
    onSelectionChange?.(Array.from(nextSelection))
  }

  function toggleRowSelection(id: number) {
    const nextSelection = new Set(selectedIds)
    if (nextSelection.has(id)) nextSelection.delete(id)
    else nextSelection.add(id)
    updateSelection(nextSelection)
  }

  function toggleAllSelection() {
    const nextSelection = new Set(selectedIds)
    if (allSelected) data.forEach((row) => nextSelection.delete(row.id))
    else data.forEach((row) => nextSelection.add(row.id))
    updateSelection(nextSelection)
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, row: T) {
    if (!onRowClick || (event.key !== 'Enter' && event.key !== ' ')) return
    if (event.target !== event.currentTarget) return
    event.preventDefault()
    onRowClick(row)
  }

  if (loading) {
    return (
      <SkeletonLoader
        columns={columns.length + Number(selectable)}
        rows={5}
        variant="table"
      />
    )
  }

  if (data.length === 0) {
    return <EmptyState description={emptyMessage} />
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <table className="w-full min-w-max text-start">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02]">
            {selectable && (
              <th className="w-12 px-4 py-3">
                <input
                  aria-label={
                    allSelected
                      ? 'Désélectionner toutes les lignes'
                      : 'Sélectionner toutes les lignes'
                  }
                  checked={allSelected}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 accent-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  onChange={toggleAllSelection}
                  ref={(element) => {
                    if (element) element.indeterminate = someSelected && !allSelected
                  }}
                  type="checkbox"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                key={String(column.key)}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
              >
                {column.sortable ? (
                  <button
                    aria-label={`Trier par ${column.label}${
                      sortKey === column.key
                        ? sortDirection === 'asc'
                          ? ', ordre croissant'
                          : ', ordre décroissant'
                        : ''
                    }`}
                    className="inline-flex items-center gap-1.5 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    onClick={() => toggleSort(column.key)}
                    type="button"
                  >
                    {column.label}
                    <span aria-hidden="true" className="text-gray-400">
                      {sortKey !== column.key
                        ? '↕'
                        : sortDirection === 'asc'
                          ? '↑'
                          : '↓'}
                    </span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => {
            const isSelected = selectedIds.has(row.id)
            return (
              <tr
                aria-selected={selectable ? isSelected : undefined}
                className={`border-b border-gray-50 transition-colors last:border-0 dark:border-gray-800 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-orange-50/40 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-orange-500 dark:hover:bg-orange-500/[0.04]'
                    : 'hover:bg-gray-50/70 dark:hover:bg-white/[0.02]'
                } ${isSelected ? 'bg-orange-50/60 dark:bg-orange-500/[0.06]' : ''}`}
                key={row.id}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(event) => handleRowKeyDown(event, row)}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {selectable && (
                  <td className="px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                    <input
                      aria-label={`Sélectionner la ligne ${row.id}`}
                      checked={isSelected}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 accent-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      onChange={() => toggleRowSelection(row.id)}
                      type="checkbox"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300"
                    key={String(column.key)}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] === null || row[column.key] === undefined
                        ? '—'
                        : String(row[column.key])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
