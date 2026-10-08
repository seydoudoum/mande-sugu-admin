import type { User } from '@/api/admin-users'
import { getRoleLabel } from '@/components/dashboard/dashboardUtils'
import { Modal } from '@/components/ui/modal'

export type UserAdminAction =
  | 'reset-password'
  | 'ban'
  | 'unban'
  | 'force-logout'
  | 'activity'
  | 'sessions'
  | 'login-history'

interface UserDetailModalProps {
  isOpen: boolean
  loading: boolean
  user: User | null
  error: string | null
  onClose: () => void
  onAction: (action: UserAdminAction) => void
  actionLoading: UserAdminAction | null
  actionData: { title: string; value: unknown } | null
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
  onAction,
  actionLoading,
  actionData,
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
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Actions administrateur
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  ['reset-password', 'Réinitialiser le mot de passe'],
                  ['ban', 'Bannir'],
                  ['unban', 'Débannir'],
                  ['force-logout', 'Forcer la déconnexion'],
                  ['activity', 'Voir l’activité'],
                  ['sessions', 'Voir les sessions'],
                  ['login-history', 'Historique de connexion'],
                ] as const
              ).map(([action, label]) => (
                <button
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-start text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-700 disabled:cursor-wait disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:border-orange-500 dark:hover:text-orange-300"
                  disabled={actionLoading !== null}
                  key={action}
                  onClick={() => onAction(action)}
                  type="button"
                >
                  {actionLoading === action ? 'Chargement…' : label}
                </button>
              ))}
            </div>
          </div>
          {actionData && (
            <section className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {actionData.title}
              </h3>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-gray-700 dark:text-gray-300">
                {JSON.stringify(actionData.value, null, 2) ??
                  String(actionData.value)}
              </pre>
            </section>
          )}
          <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-xs text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
            Si l’API renvoie 404, l’action sera signalée comme bientôt
            disponible. Les autres erreurs seront affichées sans être
            assimilées à une fonctionnalité manquante.
          </div>
        </>
      ) : null}
    </Modal>
  )
}
