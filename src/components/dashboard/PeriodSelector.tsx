export type DashboardPeriod = '7' | '30' | '90' | '365'

const periods: Array<{ value: DashboardPeriod; label: string }> = [
  { value: '7', label: '7j' },
  { value: '30', label: '30j' },
  { value: '90', label: '90j' },
  { value: '365', label: '1 an' },
]

interface PeriodSelectorProps {
  value: DashboardPeriod
  onChange: (period: DashboardPeriod) => void
}

export default function PeriodSelector({
  value,
  onChange,
}: PeriodSelectorProps) {
  return (
    <div
      aria-label="Période du tableau de bord"
      className="inline-flex max-w-full overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900"
      role="group"
    >
      {periods.map((period) => (
        <button
          aria-pressed={value === period.value}
          className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
            value === period.value
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
          }`}
          key={period.value}
          onClick={() => onChange(period.value)}
          type="button"
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
