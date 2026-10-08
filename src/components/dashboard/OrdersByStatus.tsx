import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DashboardOrder } from '@/api/admin'
import { getOrderStatus } from './dashboardUtils'

interface OrdersByStatusProps {
  orders: DashboardOrder[]
}

const statusColors: Record<string, string> = {
  pending: '#f97316',
  paid: '#3b82f6',
  processing: '#6366f1',
  shipped: '#06b6d4',
  in_transit: '#0891b2',
  delivered: '#22c55e',
  completed: '#16a34a',
  cancelled: '#ef4444',
  refunded: '#9ca3af',
}

export default function OrdersByStatus({ orders }: OrdersByStatusProps) {
  const counts = orders.reduce<Record<string, number>>((result, order) => {
    const status = order.status.toLowerCase()
    result[status] = (result[status] ?? 0) + 1
    return result
  }, {})
  const data = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    label: getOrderStatus(status).label,
  }))

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Commandes par statut
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Répartition des dernières commandes reçues
        </p>
      </div>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Aucune donnée disponible
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="h-52 w-full max-w-52">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell
                      fill={statusColors[entry.status] ?? '#9ca3af'}
                      key={entry.status}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value, _name, item) => [
                    value,
                    item.payload.label,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 sm:max-w-52 sm:grid-cols-1">
            {data.map((entry) => (
              <li
                className="flex items-center justify-between gap-2 text-sm"
                key={entry.status}
              >
                <span className="flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: statusColors[entry.status] ?? '#9ca3af',
                    }}
                  />
                  <span className="truncate">{entry.label}</span>
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {entry.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
