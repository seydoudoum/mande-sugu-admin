import type { ReactNode } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '@/icons'

export type StatCardTone = 'blue' | 'violet' | 'orange' | 'green'

interface StatCardProps {
  label: string
  value: number
  icon: ReactNode
  tone: StatCardTone
  trend?: number
  subtitle?: string
}

const tones: Record<StatCardTone, string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  violet:
    'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  orange:
    'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  green:
    'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400',
}

export default function StatCard({
  label,
  value,
  icon,
  tone,
  trend,
  subtitle,
}: StatCardProps) {
  const hasTrend = typeof trend === 'number' && Number.isFinite(trend)
  const isPositive = (trend ?? 0) >= 0

  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value.toLocaleString('fr-FR')}
          </p>
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-4 flex min-h-6 flex-wrap items-center justify-between gap-x-2 gap-y-1">
        {subtitle ? (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </span>
        ) : (
          <span />
        )}
        {hasTrend ? (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            {Math.abs(trend).toLocaleString('fr-FR', {
              maximumFractionDigits: 1,
            })}
            %
          </span>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Tendance indisponible
          </span>
        )}
      </div>
    </article>
  )
}
