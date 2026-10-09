import type { User } from '@/api/admin-users'
import { getRoleLabel } from '@/components/dashboard/dashboardUtils'
import { Modal } from '@/components/ui/modal'

interface UserDetailModalProps {
  isOpen: boolean
  loading: boolean
  user: User | null
  error: string | null
  onClose: () => void
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]">
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-white">
        {value || '—'}
      </dd>
    </div>
  )
}

export default function UserDetailModal({
  isOpen,
  loading,
  user,
  error,
  onClose,
}: UserDetailModalProps) {
  return (
    <Modal
      className="relative mx-4 w-full max-w-2xl rounded-3xl bg-white p-6 dark:bg-gray-900 sm:p-8"
      isOpen={isOpen}
      onClose={onClose}
    >
      <h2 className="pe-12 text-xl font-semibold text-gray-900 dark:text-white">
        Profil utilisateur
      </h2>
      {loading ? (
        <div
          aria-label="Chargement du profil"
          className="flex justify-center py-16"
          role="status"
        >
          <span className="h-9 w-9 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : error ? (
        <p
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : user ? (
        <>
          <div className="mt-6 flex items-center gap-4">
            {user.avatar_url ? (
              <img
                alt=""
                className="h-14 w-14 rounded-full object-cover"
                src={user.avatar_url}
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                {user.full_name.trim().charAt(0).toLocaleUpperCase('fr') || '?'}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                {user.full_name}
              </p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail label="Identifiant" value={user.id} />
            <Detail label="Rôle" value={getRoleLabel(user.role)} />
            <Detail
              label="Statut"
              value={user.is_active ? 'Actif' : 'Inactif'}
            />
            <Detail
              label="Vérification"
              value={user.is_verified ? 'Vérifié' : 'Non vérifié'}
            />
            <Detail label="Téléphone" value={user.phone || '—'} />
            <Detail label="Ville" value={user.city || '—'} />
            <Detail
              label="Date d’inscription"
              value={
                Number.isNaN(Date.parse(user.created_at))
                  ? 'Date inconnue'
                  : new Intl.DateTimeFormat('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(user.created_at))
              }
            />
          </dl>
        </>
      ) : null}
    </Modal>
  )
}
