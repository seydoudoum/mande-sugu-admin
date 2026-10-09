import type { ReactNode } from 'react'

export interface ActivityTimelineItem {
  id: string | number
  type: string
  title: string
  description?: string
  timestamp: string | Date
  icon?: ReactNode
  color?: string
}

interface ActivityTimelineProps {
  items: ActivityTimelineItem[]
  emptyMessage?: string
}

function formatRelativeDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'

  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const ranges: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ]
  let amount = seconds
  let unit: Intl.RelativeTimeFormatUnit = 'second'

  for (const [limit, nextUnit] of ranges) {
    if (Math.abs(amount) < limit) {
      unit = nextUnit
      break
    }
    amount /= limit
    unit = nextUnit
  }

  return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(
    Math.round(amount),
    unit
  )
}

function formatFullDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function ActivityTimeline({
  items,
  emptyMessage = 'Aucune activité récente.',
}: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ol aria-label="Historique des activités" className="space-y-0">
      {items.map((item, index) => (
        <li className="relative flex gap-4 pb-6 last:pb-0" key={item.id}>
          {index < items.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute inset-s-[15px] top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
            />
          )}
          <span
            aria-hidden="true"
            className="relative z-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm text-orange-600 dark:border-gray-700 dark:bg-gray-900 dark:text-orange-400"
            style={item.color ? { color: item.color, borderColor: item.color } : undefined}
          >
            {item.icon ?? (
              <span
                className="h-2.5 w-2.5 rounded-full bg-current"
                style={item.color ? { backgroundColor: item.color } : undefined}
              />
            )}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                )}
              </div>
              <time
                className="shrink-0 text-xs text-gray-400 dark:text-gray-500"
                dateTime={
                  item.timestamp instanceof Date
                    ? item.timestamp.toISOString()
                    : item.timestamp
                }
                title={formatFullDate(item.timestamp)}
              >
                {formatRelativeDate(item.timestamp)}
              </time>
            </div>
            <span className="mt-1 inline-block text-xs text-gray-400 dark:text-gray-500">
              {item.type.replaceAll('_', ' ')}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}
