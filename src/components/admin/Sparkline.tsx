import { useId } from 'react'

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
  ariaLabel?: string
}

interface Point {
  x: number
  y: number
}

function createSmoothPath(points: Point[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`
  }

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    const midpoint = (current.x + next.x) / 2
    path += ` C ${midpoint} ${current.y}, ${midpoint} ${next.y}, ${next.x} ${next.y}`
  }
  return path
}

export default function Sparkline({
  data,
  color = '#FF6A00',
  height = 40,
  width = 120,
  ariaLabel = 'Graphique de tendance',
}: SparklineProps) {
  const rawId = useId()
  const gradientId = `sparkline-gradient-${rawId.replaceAll(':', '')}`
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 120
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 40
  const values = data.filter(Number.isFinite)
  const padding = Math.min(3, safeHeight / 4)

  if (values.length === 0) {
    return (
      <span
        aria-label={`${ariaLabel} : aucune donnée`}
        className="block"
        role="img"
        style={{ height: safeHeight, width: safeWidth }}
      />
    )
  }

  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = maximum - minimum || 1
  const points = values.map((value, index) => ({
    x:
      values.length === 1
        ? safeWidth / 2
        : (index / (values.length - 1)) * safeWidth,
    y:
      safeHeight -
      padding -
      ((value - minimum) / range) * (safeHeight - padding * 2),
  }))
  const linePath = createSmoothPath(points)
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const areaPath = `${linePath} L ${lastPoint.x} ${safeHeight} L ${firstPoint.x} ${safeHeight} Z`

  return (
    <svg
      aria-label={ariaLabel}
      className="block max-w-full overflow-visible"
      height={safeHeight}
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${safeWidth} ${safeHeight}`}
      width={safeWidth}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
