import { Link } from 'react-router'
import { DownloadIcon, TableIcon, UserCircleIcon, BoxCubeIcon } from '@/icons'

interface QuickActionsProps {
  onExport: () => void
}

const linkStyles =
  'flex min-h-24 flex-col items-start justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 text-start transition hover:border-orange-200 hover:bg-orange-50 hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-orange-500/30 dark:hover:bg-orange-500/5'

export default function QuickActions({ onExport }: QuickActionsProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
        Actions rapides
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <Link className={linkStyles} to="/products">
          <span className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
            <BoxCubeIcon className="h-5 w-5" />
          </span>
          <span className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
            Gérer les produits
          </span>
        </Link>
        <Link className={linkStyles} to="/orders">
          <span className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <TableIcon className="h-5 w-5" />
          </span>
          <span className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
            Voir les commandes
          </span>
        </Link>
        <Link className={linkStyles} to="/sellers">
          <span className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
            <UserCircleIcon className="h-5 w-5" />
          </span>
          <span className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
            Gérer les vendeurs
          </span>
        </Link>
        <button className={linkStyles} onClick={onExport} type="button">
          <span className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-500/15 dark:text-green-400">
            <DownloadIcon className="h-5 w-5" />
          </span>
          <span className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            Générer un rapport
          </span>
        </button>
      </div>
    </section>
  )
}
