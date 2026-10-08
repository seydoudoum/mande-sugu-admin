import { Link } from 'react-router'
import { AlertIcon, ErrorIcon, InfoIcon } from '@/icons'
import type { DashboardAlert } from '@/api/admin'

interface AlertsPanelProps {
  alerts: DashboardAlert[]
}

const alertStyles = {
  info: {
    icon: InfoIcon,
    classes: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
  },
  warning: {
    icon: AlertIcon,
    classes:
      'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
  },
  danger: {
    icon: ErrorIcon,
    classes: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  },
}

function getAlertPath(message: string): string | null {
  const text = message.toLocaleLowerCase('fr')
  if (text.includes('commande') || text.includes('paiement')) return '/orders'
  if (text.includes('produit') || text.includes('stock')) return '/products'
  if (text.includes('utilisateur') || text.includes('vendeur')) return '/users'
  return null
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const total = alerts.reduce((sum, alert) => sum + Number(alert.count || 0), 0)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alertes
        </h2>
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
          {total}
        </span>
      </div>
      {alerts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Aucune alerte à signaler
        </p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert, index) => {
            const style = alertStyles[alert.type]
            const Icon = style.icon
            const path = getAlertPath(alert.message)
            const content = (
              <>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.classes}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {alert.message}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                  {alert.count}
                </span>
              </>
            )
            return (
              <li key={`${alert.type}-${alert.message}-${index}`}>
                {path ? (
                  <Link
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                    to={path}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl p-3">
                    {content}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
