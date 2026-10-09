import { useCallback, useEffect, useState, type FormEvent } from 'react'
import api from '@/api/client'
import { DownloadIcon, RefreshIcon } from '@/icons'
import { formatRelativeDate } from './dashboardUtils'

interface AuditEntry {
  id: number
  admin_id: number
  admin_name: string
  action: string
  entity_type: string | null
  entity_id: number | null
  details: unknown
  ip_address: string | null
  created_at: string
}

interface AuditResponse {
  success: boolean
  data: AuditEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.'
}

function csvCell(value: unknown): string {
  const text =
    typeof value === 'string' ? value : JSON.stringify(value) ?? String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function AuditLog() {
  const [adminIdDraft, setAdminIdDraft] = useState('')
  const [actionDraft, setActionDraft] = useState('')
  const [fromDraft, setFromDraft] = useState('')
  const [toDraft, setToDraft] = useState('')
  const [filters, setFilters] = useState({
    admin_id: '',
    action: '',
    from: '',
    to: '',
  })
  const [page, setPage] = useState(1)
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAuditLogs = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const response = await api.get<AuditResponse>('/admin/audit-logs', {
        params: {
          page,
          limit: 50,
          ...(filters.admin_id ? { admin_id: filters.admin_id } : {}),
          ...(filters.action ? { action: filters.action } : {}),
          ...(filters.from ? { from: filters.from } : {}),
          ...(filters.to ? { to: filters.to } : {}),
        },
      })
      setEntries(response.data.data)
      setTotal(response.data.pagination.total)
      setTotalPages(Math.max(1, response.data.pagination.totalPages))
    } catch (loadError) {
      console.error('getAdminAuditLogs:', loadError)
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters, page])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAuditLogs(), 0)
    return () => window.clearTimeout(timer)
  }, [loadAuditLogs])

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (fromDraft && toDraft && fromDraft > toDraft) {
      setError('La date de début doit précéder la date de fin.')
      return
    }
    setPage(1)
    setFilters({
      admin_id: adminIdDraft.trim(),
      action: actionDraft.trim(),
      from: fromDraft,
      to: toDraft,
    })
  }

  function exportCsv() {
    if (entries.length === 0) return
    const rows = [
      ['ID', 'Administrateur', 'Action', 'Type', 'Entité', 'Adresse IP', 'Date', 'Détails'],
      ...entries.map((entry) => [
        entry.id,
        entry.admin_name,
        entry.action,
        entry.entity_type,
        entry.entity_id,
        entry.ip_address,
        entry.created_at,
        entry.details,
      ]),
    ]
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `mande-sugu-audit-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const uniqueActions = new Set(entries.map((entry) => entry.action)).size

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Journal d’audit
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Historique vérifiable des actions administrateur.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-orange-500"
            disabled={refreshing}
            onClick={() => void loadAuditLogs()}
            type="button"
          >
            <RefreshIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading || entries.length === 0}
            onClick={exportCsv}
            type="button"
          >
            <DownloadIcon className="h-4 w-4" />
            Exporter CSV
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: 'Événements trouvés', value: total, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Types d’action sur cette page', value: uniqueActions, color: 'text-orange-600 dark:text-orange-400' },
        ].map((metric) => (
          <article
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
            key={metric.label}
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${metric.color}`}>
              {metric.value.toLocaleString('fr-FR')}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <form
          className="grid grid-cols-1 gap-3 border-b border-gray-100 p-5 dark:border-gray-800 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]"
          onSubmit={applyFilters}
        >
          <label className="sr-only" htmlFor="audit-admin-id">
            Identifiant administrateur
          </label>
          <input
            className="rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
            id="audit-admin-id"
            inputMode="numeric"
            onChange={(event) => setAdminIdDraft(event.target.value)}
            placeholder="ID administrateur"
            value={adminIdDraft}
          />
          <label className="sr-only" htmlFor="audit-action">
            Type d’action
          </label>
          <input
            className="rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
            id="audit-action"
            onChange={(event) => setActionDraft(event.target.value)}
            placeholder="Action (ex. user.role.updated)"
            value={actionDraft}
          />
          <label className="sr-only" htmlFor="audit-from">
            Depuis le
          </label>
          <input
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            id="audit-from"
            onChange={(event) => setFromDraft(event.target.value)}
            type="date"
            value={fromDraft}
          />
          <label className="sr-only" htmlFor="audit-to">
            Jusqu’au
          </label>
          <input
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            id="audit-to"
            onChange={(event) => setToDraft(event.target.value)}
            type="date"
            value={toDraft}
          />
          <button
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            disabled={refreshing}
            type="submit"
          >
            Filtrer
          </button>
        </form>

        {error && (
          <div
            className="m-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            role="alert"
          >
            <span>{error}</span>
            <button
              className="font-semibold underline underline-offset-2"
              onClick={() => void loadAuditLogs()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div
            aria-label="Chargement du journal d’audit"
            className="flex justify-center py-16"
            role="status"
          >
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucune donnée disponible.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-start">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <th className="px-5 py-3 font-medium">Administrateur</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Entité</th>
                    <th className="px-5 py-3 font-medium">Adresse IP</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      className="border-b border-gray-50 align-top hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                      key={entry.id}
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {entry.admin_name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Administrateur #{entry.admin_id}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-orange-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {entry.entity_type
                          ? `${entry.entity_type}${entry.entity_id === null ? '' : ` #${entry.entity_id}`}`
                          : '—'}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {entry.ip_address || '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(entry.created_at)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatRelativeDate(entry.created_at)}
                        </p>
                      </td>
                      <td className="max-w-64 px-5 py-4">
                        {entry.details === null ? (
                          <span className="text-sm text-gray-400">—</span>
                        ) : (
                          <details className="text-xs">
                            <summary className="cursor-pointer font-semibold text-orange-600 dark:text-orange-400">
                              Afficher
                            </summary>
                            <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-gray-50 p-3 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  type="button"
                >
                  Précédent
                </button>
                <button
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                  type="button"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
