import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from '@/icons'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  onApply: () => void
  onReset: () => void
}

export default function FilterDrawer({
  isOpen,
  onClose,
  title,
  children,
  onApply,
  onReset,
}: FilterDrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-99999">
      <button
        aria-label="Fermer les filtres"
        className="absolute inset-0 cursor-default bg-gray-950/50 backdrop-blur-[2px]"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-labelledby="filter-drawer-title"
        aria-modal="true"
        className="absolute inset-y-0 inset-e-0 flex w-full max-w-[400px] flex-col border-s border-gray-200 bg-white shadow-theme-xl transition-transform duration-300 ease-out dark:border-gray-800 dark:bg-gray-900"
        role="dialog"
      >
        <header className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2
            className="text-lg font-semibold text-gray-900 dark:text-white"
            id="filter-drawer-title"
          >
            {title}
          </h2>
          <button
            aria-label="Fermer le panneau de filtres"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 space-y-6 overflow-y-auto p-5">{children}</div>
        <footer className="flex gap-3 border-t border-gray-100 p-5 dark:border-gray-800">
          <button
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
            onClick={onReset}
            type="button"
          >
            Réinitialiser
          </button>
          <button
            className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            onClick={onApply}
            type="button"
          >
            Appliquer
          </button>
        </footer>
      </aside>
    </div>,
    document.body
  )
}
