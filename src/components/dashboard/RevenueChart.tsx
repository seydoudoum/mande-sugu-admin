import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardChartPoint } from '@/api/admin'

interface RevenueChartProps {
  data: DashboardChartPoint[]
  periodLabel: string
  limitedRange: boolean
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ payload: DashboardChartPoint }>
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white shadow-xl">
      <p className="mb-2 font-semibold">{label || point.dayLabel}</p>
      <p className="text-orange-300">
        Revenus : {Number(point.revenue).toLocaleString('fr-FR')} FCFA
      </p>
      <p className="mt-1 text-blue-300">
        Commandes : {Number(point.orders).toLocaleString('fr-FR')}
      </p>
    </div>
  )
}

export default function RevenueChart({
  data,
  periodLabel,
  limitedRange,
}: RevenueChartProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ventes — {periodLabel}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Revenus et commandes par jour
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            Revenus
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Commandes
          </span>
        </div>
      </div>
      {limitedRange && (
        <p className="mb-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-800 dark:bg-orange-500/10 dark:text-orange-200">
          L’API fournit actuellement les données des 7 derniers jours pour ce
          graphique.
        </p>
      )}
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Aucune donnée disponible
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="dayLabel"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickLine={false}
                yAxisId="revenue"
              />
              <YAxis
                axisLine={false}
                orientation="right"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickLine={false}
                width={30}
                yAxisId="orders"
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                activeDot={{ r: 5, strokeWidth: 0 }}
                dataKey="revenue"
                dot={{ r: 3, strokeWidth: 0 }}
                name="Revenus"
                stroke="#FF6A00"
                strokeWidth={3}
                type="monotone"
                yAxisId="revenue"
              />
              <Line
                activeDot={{ r: 5, strokeWidth: 0 }}
                dataKey="orders"
                dot={{ r: 3, strokeWidth: 0 }}
                name="Commandes"
                stroke="#3b82f6"
                strokeWidth={2}
                type="monotone"
                yAxisId="orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
