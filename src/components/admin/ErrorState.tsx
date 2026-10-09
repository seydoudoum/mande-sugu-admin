import { useId } from 'react'
import { RefreshIcon } from '@/icons'

interface ErrorStateProps {
  title?: string
  message: string
  retryLabel?: string
  onRetry: () => void
  supportHref?: string
  supportLabel?: string
  className?: string
}

export default function ErrorState({
  title = 'Une erreur est survenue',
  message,
  retryLabel = 'Réessayer',
  onRetry,
  supportHref,
  supportLabel = 'Contacter le support',
  className = '',
}: ErrorStateProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={`mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-red-200 bg-white px-6 py-12 text-center dark:border-red-500/20 dark:bg-white/[0.03] ${className}`}
      role="alert"
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <RefreshIcon className="h-6 w-6" />
      </span>
      <h2
        className="text-xl font-semibold text-gray-900 dark:text-white"
        id={titleId}
      >
        {title}
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          onClick={onRetry}
          type="button"
        >
          {retryLabel}
        </button>
        {supportHref && (
          <a
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-gray-700 dark:text-gray-200 dark:hover:border-orange-500"
            href={supportHref}
          >
            {supportLabel}
          </a>
        )}
      </div>
    </section>
  )
}
