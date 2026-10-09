import type { ReactNode } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '@/icons'
import Sparkline from './Sparkline'

export type StatCardColor =
  | 'blue'
  | 'violet'
  | 'orange'
  | 'green'
  | 'pink'
  | 'amber'

interface StatCardV2Props {
  label: string
  value: string | number
  trend?: number
  icon: ReactNode
  color: StatCardColor
  subtitle?: string
  sparkline?: number[]
}

const colorStyles: Record<StatCardColor, { icon: string; chart: string }> = {
  blue: {
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    chart: '#3b82f6',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    chart: '#8b5cf6',
  },
  orange: {
    icon: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    chart: '#FF6A00',
  },
  green: {
    icon: 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400',
    chart: '#22c55e',
  },
  pink: {
    icon: 'bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
    chart: '#ec4899',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    chart: '#f59e0b',
  },
}

export default function StatCardV2({
  label,
  value,
  trend,
  icon,
  color,
  subtitle,
  sparkline,
}: StatCardV2Props) {
  const hasTrend = typeof trend === 'number' && Number.isFinite(trend)
  const positive = (trend ?? 0) >= 0
  const styles = colorStyles[color]
  const accessibleValue =
    typeof value === 'number'
      ? value.toLocaleString('fr-FR')
      : value

  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-3 truncate text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {accessibleValue}
          </p>
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-4 flex min-h-6 flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {subtitle ?? ''}
        </span>
        {hasTrend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              positive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {positive ? (
              <ArrowUpIcon aria-hidden="true" className="h-4 w-4" />
            ) : (
              <ArrowDownIcon aria-hidden="true" className="h-4 w-4" />
            )}
            {positive ? '+' : ''}
            {trend.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}%
          </span>
        )}
      </div>
      {sparkline && sparkline.length > 1 && (
        <div className="mt-3">
          <Sparkline
            ariaLabel={`Évolution de ${label}`}
            color={styles.chart}
            data={sparkline}
            height={40}
            width={160}
          />
        </div>
      )}
    </article>
  )
}
