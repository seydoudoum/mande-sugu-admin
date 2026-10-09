interface StatusBadgeProps {
  status: string
}

interface StatusStyle {
  label: string
  classes: string
  marker: string
}

const statusStyles: Record<string, StatusStyle> = {
  pending: {
    label: 'En attente',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
    marker: 'bg-amber-500',
  },
  attente: {
    label: 'En attente',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
    marker: 'bg-amber-500',
  },
  paid: {
    label: 'Payée',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    marker: 'bg-blue-500',
  },
  payee: {
    label: 'Payée',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    marker: 'bg-blue-500',
  },
  processing: {
    label: 'En traitement',
    classes: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    marker: 'bg-indigo-500',
  },
  shipped: {
    label: 'Expédiée',
    classes: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    marker: 'bg-cyan-500',
  },
  expediee: {
    label: 'Expédiée',
    classes: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    marker: 'bg-cyan-500',
  },
  in_transit: {
    label: 'En transit',
    classes: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    marker: 'bg-violet-500',
  },
  transit: {
    label: 'En transit',
    classes: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    marker: 'bg-violet-500',
  },
  delivered: {
    label: 'Livrée',
    classes: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    marker: 'bg-green-500',
  },
  livree: {
    label: 'Livrée',
    classes: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    marker: 'bg-green-500',
  },
  completed: {
    label: 'Terminée',
    classes: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    marker: 'bg-green-500',
  },
  cancelled: {
    label: 'Annulée',
    classes: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    marker: 'bg-red-500',
  },
  annulee: {
    label: 'Annulée',
    classes: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    marker: 'bg-red-500',
  },
  refunded: {
    label: 'Remboursée',
    classes: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    marker: 'bg-gray-500',
  },
  remboursee: {
    label: 'Remboursée',
    classes: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    marker: 'bg-gray-500',
  },
}

function normalizeStatus(status: string): string {
  return status
    .trim()
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_')
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status)
  const style = statusStyles[normalizedStatus] ?? {
    label: status.replaceAll('_', ' ').trim() || 'Inconnu',
    classes: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    marker: 'bg-gray-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${style.classes}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${style.marker}`} />
      {style.label}
    </span>
  )
}
