import { useCallback, useEffect, useState } from 'react'
import api from '../../api/client'
import AdminToast, {
  type ToastMessage,
} from '../../components/admin/AdminToast'
import { formatRelativeDate } from '../../components/dashboard/dashboardUtils'
import { RefreshIcon } from '../../icons'

interface ConversationPerson {
  id: number
  full_name: string | null
  email: string | null
}

interface Conversation {
  id: number
  buyer_id: number
  seller_id: number
  product_id: number | null
  last_message_at: string | null
  created_at: string | null
  is_flagged: number
  buyer: ConversationPerson
  seller: ConversationPerson
  product: {
    id: number
    name: string | null
    main_image: string | null
  } | null
  last_message: string | null
  message_count: number
}

interface ConversationMessage {
  id: number
  conversation_id: number
  sender_id: number
  sender_name: string | null
  content: string | null
  attachment_url: string | null
  is_read: number | boolean
  created_at: string
}

interface ConversationDetail {
  conversation: Conversation
  messages: ConversationMessage[]
}

interface PaginatedConversations {
  success: boolean
  data: Conversation[]
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

function formatDate(value: string | null): string {
  if (!value) return 'Date inconnue'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function AdminMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [flagged, setFlagged] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const response = await api.get<PaginatedConversations>(
        '/admin/messages',
        {
          params: {
            page,
            limit: 20,
            ...(flagged ? { flagged } : {}),
          },
        }
      )
      setConversations(response.data.data)
      setTotal(response.data.pagination.total)
      setTotalPages(Math.max(1, response.data.pagination.totalPages))
    } catch (loadError) {
      console.error('loadAdminMessages:', loadError)
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [flagged, page])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadConversations(), 0)
    return () => window.clearTimeout(timer)
  }, [loadConversations])

  useEffect(() => {
    if (selectedId === null) return
    let cancelled = false

    async function loadDetail() {
      setDetail(null)
      setDetailError(null)
      setDetailLoading(true)
      try {
        const response = await api.get<{
          success: boolean
          data: ConversationDetail
        }>(`/admin/messages/${selectedId}`)
        if (!cancelled) setDetail(response.data.data)
      } catch (loadError) {
        console.error('loadAdminMessageDetail:', loadError)
        if (!cancelled) setDetailError(errorMessage(loadError))
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }

    const timer = window.setTimeout(() => void loadDetail(), 0)
    return () => {
      window.clearTimeout(timer)
      cancelled = true
    }
  }, [selectedId])

  async function toggleFlag(conversation: Conversation) {
    const nextFlag = conversation.is_flagged ? 0 : 1
    try {
      await api.put(`/admin/messages/${conversation.id}/flag`, {
        is_flagged: nextFlag,
      })
      setToast({
        type: 'success',
        text: nextFlag
          ? 'La conversation a été signalée.'
          : 'Le signalement a été retiré.',
      })
      await loadConversations()
    } catch (actionError) {
      console.error('toggleAdminMessageFlag:', actionError)
      setToast({
        type: 'error',
        text: `La mise à jour a échoué : ${errorMessage(actionError)}`,
      })
    }
  }

  const flaggedOnPage = conversations.filter(
    (conversation) => conversation.is_flagged === 1
  ).length
  const messagesOnPage = conversations.reduce(
    (count, conversation) => count + Number(conversation.message_count || 0),
    0
  )

  return (
    <div className="space-y-6">
      <AdminToast message={toast} onDismiss={() => setToast(null)} />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Messagerie et modération
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consultez les conversations et traitez les signalements.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
          disabled={refreshing}
          onClick={() => void loadConversations()}
          type="button"
        >
          <RefreshIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </header>

      <section
        aria-label="Statistiques des conversations"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          { label: 'Conversations', value: total, tone: 'text-blue-600 dark:text-blue-400' },
          { label: 'Signalées sur cette page', value: flaggedOnPage, tone: 'text-orange-600 dark:text-orange-400' },
          { label: 'Messages sur cette page', value: messagesOnPage, tone: 'text-violet-600 dark:text-violet-400' },
        ].map((metric) => (
          <article
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
            key={metric.label}
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${metric.tone}`}>
              {metric.value.toLocaleString('fr-FR')}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversations
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {total.toLocaleString('fr-FR')} résultat{total > 1 ? 's' : ''}
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span>Modération</span>
            <select
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              onChange={(event) => {
                setFlagged(event.target.value)
                setPage(1)
              }}
              value={flagged}
            >
              <option value="">Toutes</option>
              <option value="1">Signalées</option>
              <option value="0">Non signalées</option>
            </select>
          </label>
        </div>

        {error && (
          <div
            className="m-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            role="alert"
          >
            <span>Impossible de charger les conversations : {error}</span>
            <button
              className="font-semibold underline underline-offset-2"
              onClick={() => void loadConversations()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div
            aria-label="Chargement des conversations"
            className="flex justify-center py-16"
            role="status"
          >
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucune conversation disponible.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-start">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <th className="px-5 py-3 font-medium">Conversation</th>
                    <th className="px-5 py-3 font-medium">Produit</th>
                    <th className="px-5 py-3 font-medium">Dernier message</th>
                    <th className="px-5 py-3 font-medium">Activité</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 text-end font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((conversation) => (
                    <tr
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                      key={conversation.id}
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {conversation.buyer.full_name || `Client #${conversation.buyer_id}`}
                          <span className="px-1.5 font-normal text-gray-400">↔</span>
                          {conversation.seller.full_name || `Vendeur #${conversation.seller_id}`}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Conversation #{conversation.id}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {conversation.product?.name || 'Sans produit associé'}
                      </td>
                      <td className="max-w-64 px-5 py-4">
                        <p className="truncate text-sm text-gray-700 dark:text-gray-300">
                          {conversation.last_message || 'Aucun message'}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {conversation.message_count.toLocaleString('fr-FR')} message
                          {conversation.message_count === 1 ? '' : 's'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatRelativeDate(
                          conversation.last_message_at || conversation.created_at || ''
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            conversation.is_flagged
                              ? 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                              : 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                          }`}
                        >
                          {conversation.is_flagged ? 'Signalée' : 'Normale'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-orange-500"
                            onClick={() => setSelectedId(conversation.id)}
                            type="button"
                          >
                            Détails
                          </button>
                          <button
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              conversation.is_flagged
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15'
                                : 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20'
                            }`}
                            onClick={() => void toggleFlag(conversation)}
                            type="button"
                          >
                            {conversation.is_flagged ? 'Retirer le signalement' : 'Signaler'}
                          </button>
                        </div>
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

      {selectedId !== null && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center bg-gray-950/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedId(null)
          }}
        >
          <section
            aria-labelledby="conversation-detail-title"
            aria-modal="true"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900"
            role="dialog"
          >
            <header className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-gray-800">
              <div>
                <h2
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                  id="conversation-detail-title"
                >
                  Conversation #{selectedId}
                </h2>
                {detail && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {detail.conversation.buyer.full_name} ·{' '}
                    {detail.conversation.seller.full_name}
                  </p>
                )}
              </div>
              <button
                aria-label="Fermer les détails"
                className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                onClick={() => setSelectedId(null)}
                type="button"
              >
                Fermer
              </button>
            </header>
            <div className="overflow-y-auto p-5">
              {detailLoading ? (
                <div
                  aria-label="Chargement des messages"
                  className="flex min-h-48 items-center justify-center"
                  role="status"
                >
                  <span className="h-9 w-9 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                </div>
              ) : detailError ? (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                  role="alert"
                >
                  {detailError}
                </div>
              ) : !detail || detail.messages.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucune donnée disponible.
                </p>
              ) : (
                <ol className="space-y-4">
                  {detail.messages.map((message) => (
                    <li
                      className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-white/[0.03]"
                      key={message.id}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {message.sender_name || `Utilisateur #${message.sender_id}`}
                        </p>
                        <time className="text-xs text-gray-400">
                          {formatDate(message.created_at)}
                        </time>
                      </div>
                      {message.content && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                          {message.content}
                        </p>
                      )}
                      {message.attachment_url && (
                        <a
                          className="mt-3 inline-flex text-sm font-medium text-orange-600 underline underline-offset-2 dark:text-orange-400"
                          href={message.attachment_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Ouvrir la pièce jointe
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
