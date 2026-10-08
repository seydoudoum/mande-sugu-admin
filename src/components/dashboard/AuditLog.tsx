import { useCallback, useEffect, useState } from 'react'
import {
  AdminFeatureUnavailableError,
  getAdminApiErrorMessage,
  getAdminAuditLogs,
} from '@/api/admin-extended'
import { DownloadIcon, RefreshIcon } from '@/icons'
import AdminToast, { type ToastMessage } from '../admin/AdminToast'

function toCsvCell(value: unknown): string {
  const text =
    typeof value === 'string' ? value : JSON.stringify(value) ?? String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function getRows(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'object' && value !== null && 'data' in value) {
    const data = value.data
    if (Array.isArray(data)) return data
  }
  return value === null || value === undefined ? [] : [value]
}

export default function AuditLog() {
  const [adminId, setAdminId] = useState('')
  const [action, setAction] = useState('')
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(
        await getAdminAuditLogs({
          admin_id: adminId.trim() || undefined,
          action: action.trim() || undefined,
        })
      )
    } catch (loadError) {
      console.error('getAdminAuditLogs:', loadError)
      if (loadError instanceof AdminFeatureUnavailableError) {
        setToast({ type: 'info', text: loadError.message })
      }
      setError(getAdminApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [action, adminId])

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  function exportCsv() {
    const rows = getRows(data)
    if (rows.length === 0) return
    const csv = [
      ['Données du journal d’audit'],
      ...rows.map((row) => [row]),
    ]
      .map((row) => row.map(toCsvCell).join(';'))
      .join('\r\n')
    const blobUrl = URL.createObjectURL(
      new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    )
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `mande-sugu-audit-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0)
  }

  const hasData = getRows(data).length > 0

  return (
    <div className="space-y-6">
      <AdminToast message={toast} onDismiss={() => setToast(null)} />
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Journal d’audit
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Historique des actions administrateur fourni par l’API.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <label className="sr-only" htmlFor="audit-admin-id">
            Identifiant de l’administrateur
          </label>
          <input
            className="rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
            id="audit-admin-id"
            onChange={(event) => setAdminId(event.target.value)}
            placeholder="Identifiant admin"
            value={adminId}
          />
          <label className="sr-only" htmlFor="audit-action">
            Type d’action
          </label>
          <input
            className="rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
            id="audit-action"
            onChange={(event) => setAction(event.target.value)}
            placeholder="Action"
            value={action}
          />
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            disabled={loading}
            onClick={() => void refresh()}
            type="button"
          >
            <RefreshIcon
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Filtrer
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
            disabled={loading || !hasData}
            onClick={exportCsv}
            type="button"
          >
            <DownloadIcon className="h-4 w-4" />
            Exporter CSV
          </button>
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Les filtres `admin_id` et `action` sont définis par le contrat API.
          Le schéma détaillé des événements n’est pas documenté; les réponses
          sont affichées et exportées sans réinterpréter leurs champs.
        </p>
        {loading ? (
          <div
            aria-label="Chargement du journal d’audit"
            className="flex min-h-48 items-center justify-center"
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
              className="mt-2 font-semibold underline"
              onClick={() => void refresh()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        ) : !hasData ? (
          <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucune donnée d’audit disponible.
          </p>
        ) : (
          <pre className="max-h-[36rem] overflow-auto rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            {JSON.stringify(data, null, 2) ?? String(data)}
          </pre>
        )}
      </section>
    </div>
  )
}
