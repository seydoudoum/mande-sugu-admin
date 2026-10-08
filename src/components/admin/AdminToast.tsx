import { useEffect } from 'react'

export interface ToastMessage {
  type: 'success' | 'error' | 'info'
  text: string
}

interface AdminToastProps {
  message: ToastMessage | null
  onDismiss: () => void
}

export default function AdminToast({ message, onDismiss }: AdminToastProps) {
  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(onDismiss, 4000)
    return () => window.clearTimeout(timeout)
  }, [message, onDismiss])

  if (!message) return null

  const styles = {
    success:
      'border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300',
    error:
      'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
  }[message.type]

  return (
    <div
      aria-live="polite"
      className={`fixed inset-e-4 top-4 z-999999 flex max-w-md items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-theme-lg ${styles}`}
      role="status"
    >
      <span className="flex-1">{message.text}</span>
      <button
        aria-label="Fermer la notification"
        className="rounded px-1 font-semibold opacity-70 hover:opacity-100"
        onClick={onDismiss}
        type="button"
      >
        ×
      </button>
    </div>
  )
}
