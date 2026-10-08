import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAlerts,
  getChart,
  getRecentOrders,
  getRecentUsers,
  getSummary,
  getTopProducts,
  type DashboardAlert,
  type DashboardChartPoint,
  type DashboardOrder,
  type DashboardProduct,
  type DashboardUser,
  type SummaryData,
} from '../../api/admin'
import AlertsPanel from '../../components/dashboard/AlertsPanel'
import OrdersByStatus from '../../components/dashboard/OrdersByStatus'
import PeriodSelector, {
  type DashboardPeriod,
} from '../../components/dashboard/PeriodSelector'
import QuickActions from '../../components/dashboard/QuickActions'
import RecentOrdersTable from '../../components/dashboard/RecentOrdersTable'
import RecentUsers from '../../components/dashboard/RecentUsers'
import RevenueChart from '../../components/dashboard/RevenueChart'
import StatCard from '../../components/dashboard/StatCard'
import TopProducts from '../../components/dashboard/TopProducts'
import { formatCurrency, formatRelativeDate } from '../../components/dashboard/dashboardUtils'
import {
  BoxCubeIcon,
  CartIcon,
  DownloadIcon,
  DollarLineIcon,
  GroupIcon,
  RefreshIcon,
  UserMoneyIcon,
} from '../../icons'

interface DashboardData {
  summary: SummaryData
  chart: DashboardChartPoint[]
  products: DashboardProduct[]
  orders: DashboardOrder[]
  users: DashboardUser[]
  alerts: DashboardAlert[]
}

const periodLabels: Record<DashboardPeriod, string> = {
  '7': '7 derniers jours',
  '30': '30 derniers jours',
  '90': '90 derniers jours',
  '365': '12 derniers mois',
}

const summaryScope =
  'Les indicateurs sont globaux; les nouveautés sont calculées sur 7 jours. Le sélecteur ajuste uniquement la période du graphique.'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Une erreur inattendue est survenue pendant le chargement.'
}

function csvCell(value: string | number | null | undefined): string {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

function downloadCsv(data: DashboardData, period: DashboardPeriod) {
  const rows: Array<Array<string | number | null | undefined>> = [
    ['Section', 'Donnée', 'Valeur'],
    ['Résumé', 'Utilisateurs', data.summary.users.total],
    ['Résumé', 'Nouveaux utilisateurs (7 jours)', data.summary.users.newLast7Days],
    ['Résumé', 'Vendeurs', data.summary.sellers.total],
    ['Résumé', 'Produits', data.summary.products.total],
    ['Résumé', 'Nouveaux produits (7 jours)', data.summary.products.newLast7Days],
    ['Résumé', 'Commandes', data.summary.orders.total],
    ['Résumé', 'Nouvelles commandes (7 jours)', data.summary.orders.newLast7Days],
    ['Résumé', 'Revenus', data.summary.revenue.total],
    [],
    ['Commandes récentes', 'Numéro', 'Client', 'Courriel', 'Montant', 'Statut', 'Date'],
    ...data.orders.slice(0, 5).map((order) => [
      'Commande',
      order.order_number,
      order.buyer_name,
      order.buyer_email,
      order.total_amount,
      order.status,
      order.created_at,
    ]),
    [],
    ['Produits populaires', 'Nom', 'Prix', 'Ventes', 'Stock', 'Note'],
    ...data.products.slice(0, 5).map((product) => [
      'Produit',
      product.name,
      product.price,
      product.sales_count,
      product.stock,
      product.rating,
    ]),
    [],
    ['Utilisateurs récents', 'Nom', 'Courriel', 'Rôle', 'Inscription'],
    ...data.users.slice(0, 5).map((user) => [
      'Utilisateur',
      user.full_name,
      user.email,
      user.role,
      user.created_at,
    ]),
    [],
    ['Évolution journalière', 'Date', 'Jour', 'Commandes', 'Revenus'],
    ...data.chart.slice(-Number(period)).map((point) => [
      'Graphique',
      point.date,
      point.dayLabel,
      point.orders,
      point.revenue,
    ]),
    [],
    ['Alertes', 'Type', 'Message', 'Nombre'],
    ...data.alerts.map((alert) => [
      'Alerte',
      alert.type,
      alert.message,
      alert.count,
    ]),
  ]
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `mande-sugu-dashboard-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<DashboardPeriod>('7')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const requestInProgress = useRef(false)

  const loadDashboard = useCallback(async () => {
    if (requestInProgress.current) return
    requestInProgress.current = true
    setError(null)
    setRefreshing(true)
    setLoading(true)

    try {
      const [summary, chart, products, orders, users, alerts] =
        await Promise.all([
          getSummary(),
          getChart(),
          getTopProducts(),
          getRecentOrders(),
          getRecentUsers(),
          getAlerts(),
        ])
      setDashboard({ summary, chart, products, orders, users, alerts })
      setLastRefresh(new Date())
    } catch (loadError) {
      console.error('loadDashboard:', loadError)
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
      setRefreshing(false)
      requestInProgress.current = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0)
    return () => window.clearTimeout(timer)
  }, [loadDashboard])

  useEffect(() => {
    const timer = window.setInterval(() => void loadDashboard(), 30_000)
    return () => window.clearInterval(timer)
  }, [loadDashboard])

  const chartDays = Number(period)
  const chartData = dashboard?.chart.slice(-chartDays) ?? []
  const limitedRange =
    chartDays > 7 && (dashboard?.chart.length ?? 0) <= 7

  function handleExport() {
    if (dashboard) downloadCsv(dashboard, period)
  }

  if (loading && !dashboard) {
    return (
      <div
        aria-label="Chargement du tableau de bord"
        className="flex min-h-80 items-center justify-center"
        role="status"
      >
        <span className="h-11 w-11 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  if (!dashboard && error) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-red-200 bg-white px-6 py-12 text-center dark:border-red-500/20 dark:bg-white/[0.03]">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <RefreshIcon className="h-6 w-6" />
        </span>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Impossible de charger le dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button
          className="mt-6 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          onClick={() => void loadDashboard()}
          type="button"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (!dashboard) return null

  const { summary } = dashboard

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vue d’ensemble de MANDÉ SUGU
          </p>
          {lastRefresh && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Dernière actualisation : {formatRelativeDate(lastRefresh.toISOString())}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <PeriodSelector onChange={setPeriod} value={period} />
          <div className="flex gap-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
              disabled={refreshing}
              onClick={() => void loadDashboard()}
              type="button"
            >
              <RefreshIcon
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              Actualiser
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              onClick={handleExport}
              type="button"
            >
              <DownloadIcon className="h-4 w-4" />
              Exporter
            </button>
          </div>
        </div>
      </header>
      <p className="text-xs text-gray-500 dark:text-gray-400">{summaryScope}</p>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          <span>Actualisation échouée : {error}</span>
          <button
            className="font-semibold underline underline-offset-2"
            onClick={() => void loadDashboard()}
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
          subtitle={`${summary.users.newLast7Days.toLocaleString('fr-FR')} cette semaine`}
          tone="blue"
          trend={summary.users.trend}
          value={summary.users.total}
        />
        <StatCard
          icon={<UserMoneyIcon className="h-6 w-6" />}
          label="Vendeurs"
          tone="violet"
          value={summary.sellers.total}
        />
        <StatCard
          icon={<BoxCubeIcon className="h-6 w-6" />}
          label="Produits"
          subtitle={`${summary.products.newLast7Days.toLocaleString('fr-FR')} cette semaine`}
          tone="orange"
          value={summary.products.total}
        />
        <StatCard
          icon={<CartIcon className="h-6 w-6" />}
          label="Commandes"
          subtitle={`${summary.orders.newLast7Days.toLocaleString('fr-FR')} cette semaine`}
          tone="green"
          trend={summary.orders.trend}
          value={summary.orders.total}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)]">
        <article className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#E55A00] p-6 text-white shadow-theme-md">
          <div className="absolute -end-8 -top-10 -z-10 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -end-16 top-20 -z-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">Revenus totaux</p>
              <p className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {formatCurrency(summary.revenue.total)}
              </p>
              <p className="mt-2 text-sm text-white/75">
                Commandes livrées uniquement
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <DollarLineIcon className="h-6 w-6" />
            </span>
          </div>
          <div className="mt-7 flex items-center gap-2 border-t border-white/20 pt-4 text-xs text-white/80">
            <span className="rounded-full bg-white/15 px-2 py-1">Tendance</span>
            <span>Non disponible pour les revenus dans l’API actuelle</span>
          </div>
        </article>
        <RevenueChart
          data={chartData}
          limitedRange={limitedRange}
          periodLabel={periodLabels[period]}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AlertsPanel alerts={dashboard.alerts} />
        <OrdersByStatus orders={dashboard.orders} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TopProducts products={dashboard.products} />
        <RecentOrdersTable orders={dashboard.orders} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentUsers users={dashboard.users} />
        <QuickActions onExport={handleExport} />
      </section>
    </div>
  )
}
