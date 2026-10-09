interface RoleBadgeProps {
  role: string
}

interface RoleStyle {
  label: string
  classes: string
  marker: string
}

const roleStyles: Record<string, RoleStyle> = {
  client: {
    label: 'Client',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    marker: 'bg-blue-500',
  },
  seller: {
    label: 'Vendeur',
    classes: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    marker: 'bg-green-500',
  },
  admin: {
    label: 'Administrateur',
    classes: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    marker: 'bg-orange-500',
  },
  super_admin: {
    label: 'Super administrateur',
    classes: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    marker: 'bg-red-500',
  },
  logistics: {
    label: 'Logistique',
    classes: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    marker: 'bg-violet-500',
  },
  support: {
    label: 'Support',
    classes: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    marker: 'bg-gray-500',
  },
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const normalizedRole = role.trim().toLocaleLowerCase('fr')
  const style = roleStyles[normalizedRole] ?? {
    label: role.replaceAll('_', ' ').trim() || 'Inconnu',
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
