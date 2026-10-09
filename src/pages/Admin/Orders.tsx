import { useCallback, useEffect, useState } from 'react'
import { getOrders, updateOrderStatus, type Order } from '../../api/admin-orders'
import AdminToast, {
  type ToastMessage,
} from '../../components/admin/AdminToast'
import {
  formatCurrency,
  formatRelativeDate,
  getOrderStatus,
} from '../../components/dashboard/dashboardUtils'
import { RefreshIcon } from '../../icons'

const ORDER_STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payée' },
  { value: 'processing', label: 'En traitement' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'in_transit', label: 'En transit' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'refunded', label: 'Remboursée' },
]

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.'
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getOrders({
        page,
        limit: 20,
        status: statusFilter || undefined,
      })
      setOrders(response.data)
      setTotal(response.pagination.total)
      setTotalPages(Math.max(1, response.pagination.totalPages))
    } catch (loadError) {
      console.error('loadOrders:', loadError)
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 0)
    return () => window.clearTimeout(timer)
  }, [loadOrders])

  async function handleStatusChange(order: Order, newStatus: string) {
    if (newStatus === order.status) return
    const label =
      ORDER_STATUSES.find((status) => status.value === newStatus)?.label ??
      newStatus
    if (
      !window.confirm(
        `Modifier le statut de la commande ${order.order_number} vers « ${label} » ?`
      )
    ) {
      return
    }
    try {
      await updateOrderStatus(order.id, newStatus)
      setToast({
        type: 'success',
        text: `Le statut de la commande ${order.order_number} a été mis à jour.`,
      })
      await loadOrders()
    } catch (actionError) {
      console.error('handleStatusChange:', actionError)
      setToast({
        type: 'error',
        text: `La mise à jour a échoué : ${errorMessage(actionError)}`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <AdminToast message={toast} onDismiss={() => setToast(null)} />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Commandes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consultez les commandes et mettez à jour leur statut.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-orange-500"
          disabled={loading}
          onClick={() => void loadOrders()}
          type="button"
        >
          <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </header>

      <section
        aria-label="Statistiques des commandes"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          { label: 'Commandes trouvées', value: total.toLocaleString('fr-FR'), color: 'text-blue-600 dark:text-blue-400' },
          { label: 'En attente sur cette page', value: orders.filter((order) => order.status === 'pending').length.toLocaleString('fr-FR'), color: 'text-orange-600 dark:text-orange-400' },
          { label: 'Montant affiché', value: formatCurrency(orders.reduce((sum, order) => sum + Number(order.total_amount), 0)), color: 'text-green-600 dark:text-green-400' },
        ].map((metric) => (
          <article
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
            key={metric.label}
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${metric.color}`}>
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span>Statut</span>
            <select
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
              value={statusFilter}
            >
              <option value="">Tous les statuts</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            role="alert"
          >
            <span>Impossible de charger les commandes : {error}</span>
            <button
              className="font-semibold underline underline-offset-2"
              onClick={() => void loadOrders()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div
            aria-label="Chargement des commandes"
            className="flex justify-center py-12"
            role="status"
          >
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucune commande ne correspond à ce filtre.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-start">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
                  <th className="pb-3 pe-4 font-medium">Numéro</th>
                  <th className="pb-3 pe-4 font-medium">Client</th>
                  <th className="pb-3 pe-4 font-medium">Montant</th>
                  <th className="pb-3 pe-4 font-medium">Statut</th>
                  <th className="pb-3 pe-4 font-medium">Date</th>
                  <th className="pb-3 text-end font-medium">Mettre à jour</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = getOrderStatus(order.status)
                  return (
                    <tr
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                      key={order.id}
                    >
                      <td className="py-3.5 pe-4 text-sm font-semibold text-gray-900 dark:text-white">
                        #{order.order_number}
                      </td>
                      <td className="py-3.5 pe-4">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {order.buyer_name || 'Client'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.buyer_email || '—'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap py-3.5 pe-4 text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="py-3.5 pe-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${status.classes}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3.5 pe-4 text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeDate(order.created_at)}
                      </td>
                      <td className="py-3.5 text-end">
                        <label className="sr-only" htmlFor={`order-${order.id}-status`}>
                          Modifier le statut de la commande {order.order_number}
                        </label>
                        <select
                          className="max-w-40 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          id={`order-${order.id}-status`}
                          onChange={(event) =>
                            void handleStatusChange(order, event.target.value)
                          }
                          value={order.status}
                        >
                          {ORDER_STATUSES.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} sur {totalPages}
            </span>
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              type="button"
            >
              Suivant
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
