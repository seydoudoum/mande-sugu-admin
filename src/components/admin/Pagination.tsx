import { useState } from 'react'
import { ArrowRightIcon, ChevronLeftIcon } from '@/icons'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages]
  if (page >= totalPages - 3) {
    return [
      1,
      'ellipsis-start',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    'ellipsis-start',
    page - 1,
    page,
    page + 1,
    'ellipsis-end',
    totalPages,
  ]
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 20,
  onItemsPerPageChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, Math.floor(totalPages))
  const safePage = Math.min(Math.max(1, Math.floor(page)), safeTotalPages)
  const [localItemsPerPage, setLocalItemsPerPage] = useState(itemsPerPage)
  const activeItemsPerPage = onItemsPerPageChange
    ? itemsPerPage
    : localItemsPerPage
  const pageItems = getPageItems(safePage, safeTotalPages)
  const firstItem =
    totalItems === undefined || totalItems === 0
      ? 0
      : (safePage - 1) * activeItemsPerPage + 1
  const lastItem =
    totalItems === undefined
      ? undefined
      : Math.min(safePage * activeItemsPerPage, totalItems)

  function handleItemsPerPageChange(value: number) {
    setLocalItemsPerPage(value)
    onItemsPerPageChange?.(value)
    onPageChange(1)
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.02] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {totalItems !== undefined && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {firstItem}–{lastItem} sur {totalItems.toLocaleString('fr-FR')} résultats
          </p>
        )}
        <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Éléments par page</span>
          <select
            aria-label="Éléments par page"
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            onChange={(event) =>
              handleItemsPerPageChange(Number(event.target.value))
            }
            value={activeItemsPerPage}
          >
            {[10, 25, 50, 100].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <button
          aria-label="Page précédente"
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-sm font-medium text-gray-600 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-500"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          type="button"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Précédent</span>
        </button>
        {pageItems.map((item) =>
          typeof item === 'number' ? (
            <button
              aria-current={item === safePage ? 'page' : undefined}
              aria-label={`Page ${item}`}
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                item === safePage
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
              }`}
              key={item}
              onClick={() => onPageChange(item)}
              type="button"
            >
              {item}
            </button>
          ) : (
            <span
              aria-hidden="true"
              className="flex h-9 min-w-7 items-center justify-center text-sm text-gray-400"
              key={item}
            >
              …
            </span>
          )
        )}
        <button
          aria-label="Page suivante"
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-sm font-medium text-gray-600 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-500"
          disabled={safePage >= safeTotalPages}
          onClick={() => onPageChange(safePage + 1)}
          type="button"
        >
          <span>Suivant</span>
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
