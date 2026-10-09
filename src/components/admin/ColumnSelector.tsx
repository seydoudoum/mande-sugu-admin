import { useEffect, useRef, useState } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { ChevronDownIcon, TableIcon } from '@/icons'

export interface SelectableColumn {
  key: string
  label: string
  visible: boolean
}

interface ColumnSelectorProps {
  columns: SelectableColumn[]
  onChange: (columns: SelectableColumn[]) => void
}

export default function ColumnSelector({
  columns,
  onChange,
}: ColumnSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  useClickOutside(rootRef, () => setIsOpen(false))

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  function toggleColumn(key: string) {
    const target = columns.find((column) => column.key === key)
    if (!target) return
    const visibleCount = columns.filter((column) => column.visible).length
    if (target.visible && visibleCount <= 1) return

    onChange(
      columns.map((column) =>
        column.key === key ? { ...column, visible: !column.visible } : column
      )
    )
  }

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-orange-500"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <TableIcon className="h-4 w-4" />
        Colonnes
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div
          className="absolute inset-e-0 z-50 mt-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-700 dark:bg-gray-900"
          role="group"
          aria-label="Colonnes visibles"
        >
          {columns.map((column) => (
            <label
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/[0.04]"
              key={column.key}
            >
              <input
                checked={column.visible}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 accent-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                onChange={() => toggleColumn(column.key)}
                type="checkbox"
              />
              <span>{column.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
