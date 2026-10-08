import { useCallback, useEffect, useState } from 'react'
import { getAlerts, type DashboardAlert } from '../../api/admin'
import AlertsPanel from '../../components/dashboard/AlertsPanel'
import { RefreshIcon } from '../../icons'
import AdminJsonAction from '../../components/admin/AdminJsonAction'
import { broadcastAdminNotification } from '../../api/admin-extended'

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.'
}

export default function AdminNotifications() {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setAlerts(await getAlerts())
    } catch (loadError) {
      console.error('loadAlerts:', loadError)
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAlerts(), 0)
    return () => window.clearTimeout(timer)
  }, [loadAlerts])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications et alertes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Alertes opérationnelles fournies par le backend.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          disabled={loading}
          onClick={() => void loadAlerts()}
          type="button"
        >
          <RefreshIcon
            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          Actualiser
        </button>
      </header>

      <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
        Cette page affiche les alertes disponibles via l’API. Le contrat ne
        prévoit pas de flux temps réel ni d’acquittement; le schéma de diffusion
        de masse doit être saisi explicitement dans le formulaire ci-dessous.
      </p>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          <span>Impossible de charger les alertes : {error}</span>
          <button
            className="font-semibold underline underline-offset-2"
            onClick={() => void loadAlerts()}
            type="button"
          >
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div
          aria-label="Chargement des alertes"
          className="flex justify-center rounded-2xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-white/[0.03]"
          role="status"
        >
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <AlertsPanel alerts={alerts} />
      )}

      <AdminJsonAction
        buttonLabel="Envoyer la diffusion"
        confirmMessage="Envoyer cette notification à l’ensemble des destinataires configurés côté backend ?"
        description="Le backend ne documente pas le schéma du payload; fournissez le JSON attendu sans données préremplies."
        execute={broadcastAdminNotification}
        payloadLabel="Corps JSON défini par le backend"
        title="Notification de masse"
      />
    </div>
  )
}
