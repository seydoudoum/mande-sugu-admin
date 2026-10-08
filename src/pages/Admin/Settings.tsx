import { useCallback, useEffect, useState } from 'react'
import {
  AdminFeatureUnavailableError,
  getAdminApiErrorMessage,
  getAdminSettings,
  updateAdminSettings,
} from '../../api/admin-extended'
import AdminToast, {
  type ToastMessage,
} from '../../components/admin/AdminToast'
import { RefreshIcon } from '../../icons'

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? ''
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<unknown>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAdminSettings()
      setSettings(result)
      setDraft(toJson(result))
    } catch (loadError) {
      console.error('getAdminSettings:', loadError)
      if (loadError instanceof AdminFeatureUnavailableError) {
        setToast({ type: 'info', text: loadError.message })
      }
      setError(getAdminApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSettings(), 0)
    return () => window.clearTimeout(timer)
  }, [loadSettings])

  async function saveSettings() {
    if (!window.confirm('Enregistrer cette configuration sur la plateforme ?')) {
      return
    }
    let payload: unknown
    try {
      payload = JSON.parse(draft) as unknown
    } catch {
      setJsonError('La configuration doit être un JSON valide.')
      return
    }
    setJsonError(null)
    setSaving(true)
    setError(null)
    try {
      const response = await updateAdminSettings(payload)
      const savedValue = response ?? payload
      setSettings(savedValue)
      setDraft(toJson(savedValue))
      setToast({ type: 'success', text: 'La configuration a été enregistrée.' })
    } catch (saveError) {
      console.error('updateAdminSettings:', saveError)
      if (saveError instanceof AdminFeatureUnavailableError) {
        setToast({ type: 'info', text: saveError.message })
      }
      setError(getAdminApiErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminToast message={toast} onDismiss={() => setToast(null)} />
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Paramètres système
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configuration de la plateforme via les endpoints administrateur.
        </p>
      </header>
      <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
        Le schéma des paramètres n’est pas détaillé dans API.md. La configuration
        est affichée sans transformation; pour l’enregistrer, modifiez le JSON
        selon le contrat serveur.
      </p>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuration retournée par l’API
          </h2>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200"
            disabled={loading}
            onClick={() => void loadSettings()}
            type="button"
          >
            <RefreshIcon
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Recharger
          </button>
        </div>
        {loading ? (
          <div
            aria-label="Chargement de la configuration"
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
              className="mt-2 font-semibold underline"
              onClick={() => void loadSettings()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <pre className="max-h-64 overflow-auto rounded-xl bg-gray-50 p-4 text-xs text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            {toJson(settings) || 'Aucune donnée de configuration.'}
          </pre>
        )}
        {!loading && (
          <>
            <label
              className="mt-5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="settings-json"
            >
              Configuration à enregistrer (JSON)
            </label>
            <textarea
              className="mt-2 min-h-64 w-full rounded-xl border border-gray-200 bg-transparent p-4 font-mono text-xs text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:text-gray-200"
              id="settings-json"
              onChange={(event) => setDraft(event.target.value)}
              value={draft}
            />
            {jsonError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {jsonError}
              </p>
            )}
            <button
              className="mt-4 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
              onClick={() => void saveSettings()}
              type="button"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer la configuration'}
            </button>
          </>
        )}
      </section>
    </div>
  )
}
