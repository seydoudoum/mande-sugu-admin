import { useState } from 'react'
import {
  AdminFeatureUnavailableError,
  getAdminApiErrorMessage,
} from '@/api/admin-extended'
import AdminToast, { type ToastMessage } from './AdminToast'

export interface AdminResourceAction {
  key: string
  label: string
  requiresPayload?: boolean
  confirm?: (id: number) => string
  execute: (id: number, payload: unknown) => Promise<unknown>
}

interface AdminResourceActionsProps {
  title: string
  description: string
  idLabel: string
  actions: AdminResourceAction[]
}

export default function AdminResourceActions({
  title,
  description,
  idLabel,
  actions,
}: AdminResourceActionsProps) {
  const [id, setId] = useState('')
  const [payloadText, setPayloadText] = useState('')
  const [payload, setPayload] = useState<unknown>(undefined)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  function handlePayloadChange(value: string) {
    setPayloadText(value)
    setJsonError(null)
    if (!value.trim()) {
      setPayload(undefined)
      return
    }
    try {
      setPayload(JSON.parse(value) as unknown)
    } catch {
      setPayload(undefined)
      setJsonError('Le contenu doit être un JSON valide.')
    }
  }

  async function invoke(action: AdminResourceAction) {
    const resourceId = Number(id)
    if (!Number.isSafeInteger(resourceId) || resourceId <= 0) {
      setError(`Saisissez un ${idLabel.toLocaleLowerCase('fr')} valide.`)
      return
    }
    if (action.requiresPayload && (!payloadText.trim() || jsonError)) {
      setError('Un corps JSON valide est requis pour cette route.')
      return
    }
    if (action.confirm && !window.confirm(action.confirm(resourceId))) return

    setLoadingAction(action.key)
    setError(null)
    setResult(null)
    try {
      const response = await action.execute(resourceId, payload)
      setResult(response)
      setToast({ type: 'success', text: 'La requête a été acceptée par l’API.' })
    } catch (requestError) {
      console.error(`AdminResourceActions (${action.key}):`, requestError)
      const message = getAdminApiErrorMessage(requestError)
      if (requestError instanceof AdminFeatureUnavailableError) {
        setToast({ type: 'info', text: message })
      }
      setError(message)
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <AdminToast message={toast} onDismiss={() => setToast(null)} />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      <label
        className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300"
        htmlFor={`resource-id-${title.replaceAll(/\s+/g, '-')}`}
      >
        {idLabel}
      </label>
      <input
        className="mt-2 w-full max-w-sm rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:text-white"
        id={`resource-id-${title.replaceAll(/\s+/g, '-')}`}
        inputMode="numeric"
        onChange={(event) => setId(event.target.value)}
        value={id}
      />
      {actions.some((action) => action.requiresPayload) && (
        <>
          <label
            className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor={`resource-payload-${title.replaceAll(/\s+/g, '-')}`}
          >
            Corps JSON (requis lorsque l’action le demande)
          </label>
          <textarea
            className="mt-2 min-h-28 w-full rounded-xl border border-gray-200 bg-transparent p-3 font-mono text-xs text-gray-800 dark:border-gray-700 dark:text-gray-200"
            id={`resource-payload-${title.replaceAll(/\s+/g, '-')}`}
            onChange={(event) => handlePayloadChange(event.target.value)}
            placeholder={'{\n  \n}'}
            value={payloadText}
          />
          {jsonError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {jsonError}
            </p>
          )}
        </>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-wait disabled:opacity-60 dark:border-gray-700 dark:text-gray-200"
            disabled={
              loadingAction !== null ||
              (action.requiresPayload &&
                (!payloadText.trim() || Boolean(jsonError)))
            }
            key={action.key}
            onClick={() => void invoke(action)}
            type="button"
          >
            {loadingAction === action.key ? 'Envoi…' : action.label}
          </button>
        ))}
      </div>
      {error && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}
      {result !== null && (
        <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-950 dark:text-gray-300">
          {JSON.stringify(result, null, 2) ?? String(result)}
        </pre>
      )}
    </section>
  )
}
