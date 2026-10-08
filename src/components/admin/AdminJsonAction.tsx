import { useState } from 'react'
import {
  AdminFeatureUnavailableError,
  getAdminApiErrorMessage,
} from '@/api/admin-extended'
import AdminToast, { type ToastMessage } from './AdminToast'

interface AdminJsonActionProps {
  title: string
  description: string
  payloadLabel: string
  buttonLabel: string
  confirmMessage?: string
  execute: (payload: unknown) => Promise<unknown>
}

export default function AdminJsonAction({
  title,
  description,
  payloadLabel,
  buttonLabel,
  confirmMessage,
  execute,
}: AdminJsonActionProps) {
  const [payloadText, setPayloadText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  let parsedPayload: unknown
  let jsonError: string | null = null
  if (payloadText.trim()) {
    try {
      parsedPayload = JSON.parse(payloadText) as unknown
    } catch {
      jsonError = 'Le contenu doit être un JSON valide.'
    }
  }

  async function handleSubmit() {
    if (!payloadText.trim() || jsonError) return
    if (confirmMessage && !window.confirm(confirmMessage)) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await execute(parsedPayload)
      setResult(response)
      setToast({ type: 'success', text: 'La requête a été acceptée par l’API.' })
    } catch (requestError) {
      console.error(`AdminJsonAction (${title}):`, requestError)
      const message = getAdminApiErrorMessage(requestError)
      if (requestError instanceof AdminFeatureUnavailableError) {
        setToast({ type: 'info', text: message })
      }
      setError(message)
    } finally {
      setLoading(false)
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
        htmlFor={`payload-${title.replaceAll(/\s+/g, '-')}`}
      >
        {payloadLabel}
      </label>
      <textarea
        className="mt-2 min-h-32 w-full rounded-xl border border-gray-200 bg-transparent p-3 font-mono text-xs text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:text-gray-200"
        id={`payload-${title.replaceAll(/\s+/g, '-')}`}
        onChange={(event) => setPayloadText(event.target.value)}
        placeholder={'{\n  \n}'}
        value={payloadText}
      />
      {jsonError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {jsonError}
        </p>
      )}
      {error && (
        <p
          className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}
      <button
        className="mt-4 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={loading || !payloadText.trim() || Boolean(jsonError)}
        onClick={() => void handleSubmit()}
        type="button"
      >
        {loading ? 'Envoi…' : buttonLabel}
      </button>
      {result !== null && (
        <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-950 dark:text-gray-300">
          {JSON.stringify(result, null, 2) ?? String(result)}
        </pre>
      )}
    </section>
  )
}
