interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'table'
  rows?: number
  columns?: number
  className?: string
}

export default function SkeletonLoader({
  variant = 'text',
  rows = 3,
  columns = 4,
  className = '',
}: SkeletonLoaderProps) {
  if (variant === 'card') {
    return (
      <div
        aria-label="Chargement du contenu"
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}
        role="status"
      >
        {Array.from({ length: Math.max(1, rows) }, (_, index) => (
          <div
            className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
            key={index}
          >
            <div className="h-4 w-2/5 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-5 h-8 w-3/5 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 h-3 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
        <span className="sr-only">Chargement…</span>
      </div>
    )
  }

  if (variant === 'table') {
    const safeColumns = Math.max(1, columns)
    return (
      <div
        aria-label="Chargement du tableau"
        className={`overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
        role="status"
      >
        <div
          className="grid gap-4 border-b border-gray-100 pb-4 dark:border-gray-800"
          style={{ gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: safeColumns }, (_, index) => (
            <div
              className="h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              key={index}
            />
          ))}
        </div>
        <div className="space-y-5 pt-5">
          {Array.from({ length: Math.max(1, rows) }, (_, rowIndex) => (
            <div
              className="grid gap-4"
              key={rowIndex}
              style={{
                gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: safeColumns }, (_, columnIndex) => (
                <div
                  className="h-4 animate-pulse rounded bg-gray-100 dark:bg-gray-800"
                  key={columnIndex}
                />
              ))}
            </div>
          ))}
        </div>
        <span className="sr-only">Chargement…</span>
      </div>
    )
  }

  return (
    <div
      aria-label="Chargement du contenu"
      className={`space-y-3 ${className}`}
      role="status"
    >
      {Array.from({ length: Math.max(1, rows) }, (_, index) => (
        <div
          className={`h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${
            index === rows - 1 ? 'w-2/3' : 'w-full'
          }`}
          key={index}
        />
      ))}
      <span className="sr-only">Chargement…</span>
    </div>
  )
}
