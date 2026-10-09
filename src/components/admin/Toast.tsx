import { useToastStore, type ToastType } from '@/hooks/useToast'

const styles: Record<ToastType, string> = {
  success:
    'border-green-200 bg-green-50 text-green-900 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300',
  error:
    'border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  warning:
    'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
}

const labels: Record<ToastType, string> = {
  success: 'Succès',
  error: 'Erreur',
  warning: 'Attention',
  info: 'Information',
}

export default function Toast() {
  const toasts = useToastStore((state) => state.toasts)
  const dismissToast = useToastStore((state) => state.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed inset-e-4 top-4 z-999999 flex w-[calc(100%-2rem)] max-w-md flex-col gap-3"
      role="region"
    >
      {toasts.map((toast) => (
        <div
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-theme-lg transition-all duration-200 ${styles[toast.type]}`}
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{labels[toast.type]}</p>
            <p className="mt-0.5 break-words opacity-90">{toast.message}</p>
          </div>
          <button
            aria-label="Fermer la notification"
            className="rounded px-1 font-semibold opacity-70 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            onClick={() => dismissToast(toast.id)}
            type="button"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
