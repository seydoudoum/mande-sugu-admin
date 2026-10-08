export function formatCurrency(value: number | string): string {
  return `${Number(value).toLocaleString('fr-FR', {
    maximumFractionDigits: 0,
  })} FCFA`
}

export function formatRelativeDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'

  const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const ranges: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ]
  let amount = elapsedSeconds
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

export function getOrderStatus(status: string): {
  label: string
  classes: string
} {
  const statuses: Record<string, { label: string; classes: string }> = {
    pending: {
      label: 'En attente',
      classes:
        'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    },
    paid: {
      label: 'Payée',
      classes:
        'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    },
    processing: {
      label: 'En traitement',
      classes:
        'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    },
    shipped: {
      label: 'Expédiée',
      classes:
        'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    },
    in_transit: {
      label: 'En transit',
      classes:
        'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    },
    delivered: {
      label: 'Livrée',
      classes:
        'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    },
    completed: {
      label: 'Terminée',
      classes:
        'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    },
    cancelled: {
      label: 'Annulée',
      classes: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    },
    refunded: {
      label: 'Remboursée',
      classes:
        'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    },
  }

  return (
    statuses[status.toLowerCase()] ?? {
      label: status.replaceAll('_', ' '),
      classes: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    }
  )
}

export function getRoleLabel(role: string): string {
  const roles: Record<string, string> = {
    client: 'Client',
    seller: 'Vendeur',
    admin: 'Administrateur',
    super_admin: 'Super administrateur',
    logistics: 'Logistique',
    support: 'Support',
  }
  return roles[role.toLowerCase()] ?? role.replaceAll('_', ' ')
}
