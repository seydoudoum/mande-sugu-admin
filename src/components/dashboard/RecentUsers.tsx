import { Link } from 'react-router'
import type { DashboardUser } from '@/api/admin'
import { formatRelativeDate, getRoleLabel } from './dashboardUtils'

interface RecentUsersProps {
  users: DashboardUser[]
}

const avatarColors = [
  'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
]

export default function RecentUsers({ users }: RecentUsersProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nouveaux utilisateurs
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Les dernières inscriptions
          </p>
        </div>
        <Link
          className="shrink-0 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400"
          to="/users"
        >
          Voir tout
        </Link>
      </div>
      {users.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Aucun utilisateur disponible
        </p>
      ) : (
        <ul className="space-y-3">
          {users.slice(0, 5).map((user, index) => {
            const initial = user.full_name.trim().charAt(0).toLocaleUpperCase('fr') || '?'
            return (
              <li className="flex items-center gap-3" key={user.id}>
                {user.avatar_url ? (
                  <img
                    alt={user.full_name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                    loading="lazy"
                    src={user.avatar_url}
                  />
                ) : (
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      avatarColors[index % avatarColors.length]
                    }`}
                  >
                    {initial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.full_name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {getRoleLabel(user.role)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatRelativeDate(user.created_at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
