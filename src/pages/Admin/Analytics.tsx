import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getAlerts,
  getRecentOrders,
  getTopProducts,
  type DashboardAlert,
  type DashboardOrder,
  type DashboardProduct,
} from '../../api/admin'
import api from '../../api/client'
import {
  getAdminAnalyticsOverview,
  getAdminApiErrorMessage,
} from '../../api/admin-extended'
import AlertsPanel from '../../components/dashboard/AlertsPanel'
import OrdersByStatus from '../../components/dashboard/OrdersByStatus'
import PeriodSelector, {
  type DashboardPeriod,
} from '../../components/dashboard/PeriodSelector'
import StatCard from '../../components/dashboard/StatCard'
import TopProducts from '../../components/dashboard/TopProducts'
import { formatCurrency } from '../../components/dashboard/dashboardUtils'
import {
  BoxCubeIcon,
  CartIcon,
  DollarLineIcon,
  GroupIcon,
  RefreshIcon,
  UserMoneyIcon,
} from '../../icons'

interface Metric {
  total: number
  growth: number
}

interface AnalyticsOverview {
  users: Metric
  sellers: Metric
  products: Metric
  orders: Metric
  revenue: Metric
  average_cart: number
  conversion_rate: number
}

interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

interface AnalyticsData {
  overview: AnalyticsOverview
  revenue: RevenuePoint[]
  products: DashboardProduct[]
  orders: DashboardOrder[]
  alerts: DashboardAlert[]
}

const periods: Record<DashboardPeriod, { api: string; label: string }> = {
  '7': { api: '7d', label: '7 derniers jours' },
  '30': { api: '30d', label: '30 derniers jours' },
  '90': { api: '90d', label: '90 derniers jours' },
  '365': { api: '1y', label: '1 an' },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toNumber(value: unknown, label: string): number {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) {
    throw new Error(`Donnée invalide reçue pour ${label}.`)
  }
  return number
}

function parseMetric(value: unknown, label: string): Metric {
  if (!isRecord(value)) throw new Error(`Données invalides reçues pour ${label}.`)
  return {
    total: toNumber(value.total, `${label}.total`),
    growth: toNumber(value.growth, `${label}.growth`),
  }
}

function parseOverview(value: unknown): AnalyticsOverview {
  if (!isRecord(value)) throw new Error('Format de données analytics invalide.')
  return {
    users: parseMetric(value.users, 'utilisateurs'),
    sellers: parseMetric(value.sellers, 'vendeurs'),
    products: parseMetric(value.products, 'produits'),
    orders: parseMetric(value.orders, 'commandes'),
    revenue: parseMetric(value.revenue, 'revenus'),
    average_cart: toNumber(value.average_cart, 'panier moyen'),
    conversion_rate: toNumber(value.conversion_rate, 'taux de conversion'),
  }
}

function parseRevenue(value: unknown): RevenuePoint[] {
  if (!Array.isArray(value)) throw new Error('Format de données de revenus invalide.')
  return value.map((item) => {
    if (!isRecord(item) || typeof item.date !== 'string') {
      throw new Error('Une entrée de revenus est invalide.')
    }
    const date = new Date(item.date)
    if (Number.isNaN(date.getTime())) {
      throw new Error('Une date de revenus est invalide.')
    }
    return {
      date: date.toISOString().slice(0, 10),
      revenue: toNumber(item.revenue, 'revenu journalier'),
      orders: toNumber(item.orders, 'commandes journalières'),
    }
  })
}

function fillMissingDays(points: RevenuePoint[], days: number): RevenuePoint[] {
  if (points.length === 0) return []

  const byDate = new Map(points.map((point) => [point.date, point]))
  const end = new Date()
  end.setUTCHours(0, 0, 0, 0)
  end.setUTCDate(end.getUTCDate() + 1)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - days)
  const result: RevenuePoint[] = []

  for (let day = new Date(start); day < end; day.setUTCDate(day.getUTCDate() + 1)) {
    const date = day.toISOString().slice(0, 10)
    result.push(byDate.get(date) ?? { date, revenue: 0, orders: 0 })
  }
  return result
}

function formatChartDate(value: string, year = false): string {
  const date = new Date(`${value}T00:00:00.000Z`)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    ...(year ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(date)
}

function getErrorMessage(error: unknown): string {
  return getAdminApiErrorMessage(error)
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<DashboardPeriod>('30')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const loadAnalytics = useCallback(async () => {
    const currentRequestId = ++requestId.current
    setRefreshing(true)
    setError(null)

    try {
      const [overview, revenueResponse, products, orders, alerts] =
        await Promise.all([
          getAdminAnalyticsOverview(),
          api.get<{ success: boolean; data: unknown }>('/admin/analytics/revenue', {
            params: { period: periods[period].api },
          }),
          getTopProducts(),
          getRecentOrders(),
          getAlerts(),
        ])

      if (currentRequestId !== requestId.current) return

      const body: unknown = revenueResponse.data.data
      const days = Number(period)
      setAnalytics({
        overview: parseOverview(overview),
        revenue: fillMissingDays(parseRevenue(body), days),
        products,
        orders,
        alerts,
      })
    } catch (loadError) {
      if (currentRequestId !== requestId.current) return
      console.error('loadAdminAnalytics:', loadError)
      setError(getErrorMessage(loadError))
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [period])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAnalytics(), 0)
    return () => {
      window.clearTimeout(timer)
      requestId.current += 1
    }
  }, [loadAnalytics])

  if (loading && !analytics) {
    return (
      <div
        aria-label="Chargement des statistiques"
        className="flex min-h-80 items-center justify-center"
        role="status"
      >
        <span className="h-11 w-11 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  if (!analytics && error) {
    return (
      <div
        className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-red-200 bg-white px-6 py-12 text-center dark:border-red-500/20 dark:bg-white/[0.03]"
        role="alert"
      >
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <RefreshIcon className="h-6 w-6" />
        </span>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Impossible de charger les analytics
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button
          className="mt-6 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          onClick={() => void loadAnalytics()}
          type="button"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (!analytics) return null

  const { overview } = analytics
  const periodLabel = periods[period].label
  const chartHasData = analytics.revenue.some(
    (point) => point.revenue !== 0 || point.orders !== 0
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analyse des performances de MANDÉ SUGU
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <PeriodSelector onChange={setPeriod} value={period} />
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
            disabled={refreshing}
            onClick={() => void loadAnalytics()}
            type="button"
          >
            <RefreshIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </header>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          <span>Actualisation échouée : {error}</span>
          <button
            className="font-semibold underline underline-offset-2"
            onClick={() => void loadAnalytics()}
            type="button"
          >
            Réessayer
          </button>
        </div>
      )}

      <section
        aria-label="Indicateurs clés"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={<GroupIcon className="h-6 w-6" />}
          label="Utilisateurs"
          subtitle="(30 derniers jours)"
          tone="blue"
          trend={overview.users.growth}
          value={overview.users.total}
        />
        <StatCard
          icon={<UserMoneyIcon className="h-6 w-6" />}
          label="Vendeurs"
          subtitle="(30 derniers jours)"
          tone="violet"
          trend={overview.sellers.growth}
          value={overview.sellers.total}
        />
        <StatCard
          icon={<BoxCubeIcon className="h-6 w-6" />}
          label="Produits"
          subtitle="(30 derniers jours)"
          tone="orange"
          trend={overview.products.growth}
          value={overview.products.total}
        />
        <StatCard
          icon={<CartIcon className="h-6 w-6" />}
          label="Commandes"
          subtitle="(30 derniers jours)"
          tone="green"
          trend={overview.orders.growth}
          value={overview.orders.total}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article
          className="relative isolate overflow-hidden rounded-2xl p-6 text-white shadow-theme-md"
          style={{
            backgroundImage: 'linear-gradient(135deg, #FF6A00 0%, #E55A00 100%)',
          }}
        >
          <div className="absolute -end-8 -top-10 -z-10 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -end-16 top-20 -z-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">Revenus totaux</p>
              <p className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {formatCurrency(overview.revenue.total)}
              </p>
              <p className="mt-2 text-sm text-white/75">
                Commandes livrées et terminées
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <DollarLineIcon className="h-6 w-6" />
            </span>
          </div>
          <div className="mt-7 flex items-center gap-2 border-t border-white/20 pt-4 text-sm">
            <span className="rounded-full bg-white/15 px-2.5 py-1 font-semibold">
              {overview.revenue.growth > 0 ? '+' : ''}
              {overview.revenue.growth.toLocaleString('fr-FR', {
                maximumFractionDigits: 1,
              })}
              %
            </span>
            <span className="text-white/80">par rapport aux 30 jours précédents</span>
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Panier moyen
              </p>
              <p className="mt-5 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {formatCurrency(overview.average_cart)}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Par commande livrée
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <CartIcon className="h-6 w-6" />
            </span>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenus sur les {periodLabel}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Évolution quotidienne du chiffre d’affaires
          </p>
        </div>
        {!chartHasData ? (
          <div className="flex h-72 items-center justify-center text-sm text-gray-400">
            Aucune donnée disponible
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart
                data={analytics.revenue}
                margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="analyticsRevenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FF6A00" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#FF6A00" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="date"
                  minTickGap={24}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value: string) => formatChartDate(value, period === '365')}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={(value: number) => Number(value).toLocaleString('fr-FR')}
                  tickLine={false}
                  width={72}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    const point = payload?.[0]?.payload as RevenuePoint | undefined
                    if (!active || !point) return null
                    return (
                      <div className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white shadow-xl">
                        <p className="mb-2 font-semibold">{formatChartDate(point.date, true)}</p>
                        <p className="text-orange-300">
                          Revenus : {formatCurrency(point.revenue)}
                        </p>
                        <p className="mt-1 text-blue-300">
                          Commandes : {point.orders.toLocaleString('fr-FR')}
                        </p>
                      </div>
                    )
                  }}
                />
                <Area
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  dataKey="revenue"
                  fill="url(#analyticsRevenueGradient)"
                  name="Revenus"
                  stroke="#FF6A00"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TopProducts products={analytics.products} />
        <OrdersByStatus orders={analytics.orders} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AlertsPanel alerts={analytics.alerts} />
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Taux de conversion
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Acheteurs parmi les utilisateurs
            </p>
          </div>
          <div className="flex min-h-40 flex-col items-center justify-center">
            <p className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {overview.conversion_rate.toLocaleString('fr-FR', {
                maximumFractionDigits: 1,
              })}
              <span className="text-3xl text-orange-500">%</span>
            </p>
            <div
              aria-label={`Taux de conversion ${overview.conversion_rate}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={Math.min(Math.max(overview.conversion_rate, 0), 100)}
              className="mt-5 h-2.5 w-full max-w-sm overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{
                  width: `${Math.min(Math.max(overview.conversion_rate, 0), 100)}%`,
                }}
              />
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
