import type { ReactNode } from 'react'
import { CloseIcon } from '@/icons'

export interface BulkAction {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'primary' | 'danger'
}

interface BulkActionsBarProps {
  selectedCount: number
  onClear: () => void
  actions: BulkAction[]
}

const actionStyles: Record<NonNullable<BulkAction['variant']>, string> = {
  default: 'bg-white/10 text-white hover:bg-white/20',
  primary: 'bg-orange-500 text-white hover:bg-orange-600',
  danger: 'bg-red-500/20 text-red-100 hover:bg-red-500/35',
}

export default function BulkActionsBar({
  selectedCount,
  onClear,
  actions,
}: BulkActionsBarProps) {
  if (selectedCount <= 0) return null

  return (
    <div
      aria-label="Actions sur la sélection"
      className="fixed inset-s-1/2 bottom-8 z-9999 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white shadow-theme-xl motion-safe:animate-[slide-up_200ms_ease-out] rtl:translate-x-1/2 sm:gap-4 sm:px-5"
      role="toolbar"
    >
      <span className="shrink-0 text-sm font-semibold">
        {selectedCount.toLocaleString('fr-FR')} sélectionné
        {selectedCount === 1 ? '' : 's'}
      </span>
      <span aria-hidden="true" className="h-6 w-px bg-white/20" />
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
        {actions.map((action) => (
          <button
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${actionStyles[action.variant ?? 'default']}`}
            key={action.label}
            onClick={action.onClick}
            type="button"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
      <button
        aria-label="Effacer la sélection"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
        onClick={onClear}
        type="button"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
