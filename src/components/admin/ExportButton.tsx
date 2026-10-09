import { DownloadIcon } from '@/icons'

export interface ExportColumn<T extends object> {
  key: keyof T
  label: string
  value?: (row: T) => unknown
}

interface ExportButtonProps<T extends object> {
  data: T[]
  filename?: string
  columns?: ExportColumn<T>[]
  disabled?: boolean
}

function csvCell(value: unknown): string {
  let text: string
  if (value === null || value === undefined) text = ''
  else if (value instanceof Date) text = value.toISOString()
  else if (typeof value === 'object') text = JSON.stringify(value)
  else text = String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function getFilename(filename?: string): string {
  const date = new Date().toISOString().slice(0, 10)
  const base = filename?.trim() || `mande-sugu-export-${date}`
  const safeBase = base
    .replace(/[<>:"/\\|?*]/g, '-')
    .split('')
    .map((character) =>
      character.charCodeAt(0) <= 0x1f ? '-' : character
    )
    .join('')
  return `${safeBase.replace(/\.csv$/i, '')}.csv`
}

export default function ExportButton<T extends object>({
  data,
  filename,
  columns,
  disabled = false,
}: ExportButtonProps<T>) {
  function exportCsv() {
    if (disabled || data.length === 0) return
    const selectedColumns: ExportColumn<T>[] =
      columns ??
      (Object.keys(data[0]) as Array<keyof T>).map((key) => ({
        key,
        label: String(key),
      }))
    const rows = [
      selectedColumns.map((column) => column.label),
      ...data.map((row) =>
        selectedColumns.map((column) =>
          column.value ? column.value(row) : row[column.key]
        )
      ),
    ]
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = getFilename(filename)
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <button
      aria-label="Exporter les données au format CSV"
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-orange-500"
      disabled={disabled || data.length === 0}
      onClick={exportCsv}
      type="button"
    >
      <DownloadIcon className="h-4 w-4" />
      Exporter CSV
    </button>
  )
}
