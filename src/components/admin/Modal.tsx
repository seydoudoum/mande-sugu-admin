import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  titleId: string
  descriptionId?: string
  className?: string
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
  isFullscreen?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  children,
  titleId,
  descriptionId,
  className = '',
  closeOnBackdrop = true,
  showCloseButton = true,
  isFullscreen = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [isOpen])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }

    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) {
      event.preventDefault()
      dialogRef.current.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        document.activeElement === dialogRef.current)
    ) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
      <button
        aria-label="Fermer la fenêtre"
        className="absolute inset-0 cursor-default bg-gray-950/60 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={`relative z-1 max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-theme-xl outline-none dark:border-gray-800 dark:bg-gray-900 ${
          isFullscreen ? 'h-[calc(100vh-2rem)] max-w-none' : 'max-w-2xl'
        } ${className}`}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        {showCloseButton && (
          <button
            aria-label="Fermer la fenêtre"
            className="absolute inset-e-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
