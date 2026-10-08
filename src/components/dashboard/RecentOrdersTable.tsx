import { Link } from 'react-router'
import type { DashboardOrder } from '@/api/admin'
import { formatCurrency, formatRelativeDate, getOrderStatus } from './dashboardUtils'

interface RecentOrdersTableProps {
  orders: DashboardOrder[]
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dernières commandes
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Activité récente de la boutique
          </p>
        </div>
        <Link
          className="shrink-0 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400"
          to="/orders"
        >
          Voir tout
        </Link>
      </div>
      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Aucune commande disponible
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-start">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-800">
                <th className="pb-3 pe-4 font-medium">Numéro</th>
                <th className="pb-3 pe-4 font-medium">Client</th>
                <th className="pb-3 pe-4 font-medium">Montant</th>
                <th className="pb-3 pe-4 font-medium">Statut</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => {
                const status = getOrderStatus(order.status)
                return (
                  <tr
                    className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/70 dark:border-gray-800/70 dark:hover:bg-white/[0.02]"
                    key={order.id}
                  >
                    <td className="py-3.5 pe-4 text-sm font-semibold text-gray-900 dark:text-white">
                      #{order.order_number}
                    </td>
                    <td className="py-3.5 pe-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {order.buyer_name || 'Client'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.buyer_email || '—'}
                      </p>
                    </td>
                    <td className="py-3.5 pe-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="py-3.5 pe-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${status.classes}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3.5 text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeDate(order.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
