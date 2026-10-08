import { useCallback, useEffect, useState } from 'react'
import {
  getAdminApiErrorMessage,
  AdminFeatureUnavailableError,
} from '@/api/admin-extended'
import { RefreshIcon } from '@/icons'
import AdminToast, { type ToastMessage } from './AdminToast'

interface AdminDataPanelProps {
  title: string
  description: string
  loadData: () => Promise<unknown>
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

export default function AdminDataPanel({
  title,
  description,
  loadData,
}: AdminDataPanelProps) {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await loadData())
    } catch (loadError) {
      console.error(`AdminDataPanel (${title}):`, loadError)
      if (loadError instanceof AdminFeatureUnavailableError) {
        setToast({ type: 'info', text: loadError.message })
      }
      setError(getAdminApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [loadData, title])

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  const hasData =
    data !== null &&
    data !== undefined &&
    !(Array.isArray(data) && data.length === 0)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <AdminToast message={toast} onDismiss={() => setToast(null)} />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200"
          disabled={loading}
          onClick={() => void refresh()}
          type="button"
        >
          <RefreshIcon
            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          Actualiser
        </button>
      </div>
      {loading ? (
        <div
          aria-label={`Chargement : ${title}`}
          className="flex min-h-40 items-center justify-center"
          role="status"
        >
          <span className="h-9 w-9 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          <p>{error}</p>
          <button
            className="mt-2 font-semibold underline underline-offset-2"
            onClick={() => void refresh()}
            type="button"
          >
            Réessayer
          </button>
        </div>
      ) : !hasData ? (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          Aucune donnée disponible.
        </p>
      ) : (
        <pre className="max-h-[32rem] overflow-auto rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
          {formatJson(data)}
        </pre>
      )}
    </section>
  )
}
