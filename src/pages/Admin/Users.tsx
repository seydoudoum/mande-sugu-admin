import { useCallback, useEffect, useState } from 'react'
import {
  deleteUser,
  getUserById,
  getUsers,
  toggleUserStatus,
  updateUserRole,
  type User,
} from '../../api/admin-users'
import {
  banUser,
  forceUserLogout,
  getAdminApiErrorMessage,
  getUserActivity,
  getUserLoginHistory,
  getUserSessions,
  resetUserPassword,
  unbanUser,
} from '../../api/admin-extended'
import AdminToast, {
  type ToastMessage,
} from '../../components/admin/AdminToast'
import UserDetailModal, {
  type UserAdminAction,
} from '../../components/admin/UserDetailModal'

const ROLES = [
  { value: 'client', label: 'Client', color: 'bg-blue-100 text-blue-700' },
  { value: 'seller', label: 'Vendeur', color: 'bg-green-100 text-green-700' },
  { value: 'admin', label: 'Admin', color: 'bg-orange-100 text-orange-700' },
  {
    value: 'super_admin',
    label: 'Super Admin',
    color: 'bg-red-100 text-red-700',
  },
  {
    value: 'logistics',
    label: 'Logistique',
    color: 'bg-purple-100 text-purple-700',
  },
  { value: 'support', label: 'Support', color: 'bg-gray-100 text-gray-700' },
]

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.'
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<UserAdminAction | null>(
    null
  )
  const [actionData, setActionData] = useState<{
    title: string
    value: unknown
  } | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getUsers({
        page,
        limit: 20,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      setUsers(response.data)
      setTotalPages(Math.max(1, response.pagination.totalPages))
    } catch (loadError) {
      console.error('loadUsers:', loadError)
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, search, statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 250)
    return () => window.clearTimeout(timer)
  }, [loadUsers])

  async function handleRoleChange(user: User, newRole: string) {
    if (newRole === user.role) return
    if (!window.confirm(`Changer le rôle de ${user.full_name} en "${newRole}" ?`)) {
      return
    }
    try {
      await updateUserRole(user.id, newRole)
      setToast({ type: 'success', text: 'Le rôle a été mis à jour.' })
      await loadUsers()
    } catch (actionError) {
      console.error('handleRoleChange:', actionError)
      setToast({
        type: 'error',
        text: `La modification du rôle a échoué : ${errorMessage(actionError)}`,
      })
    }
  }

  async function handleToggleStatus(user: User) {
    const action = user.is_active ? 'désactiver' : 'activer'
    if (!window.confirm(`Voulez-vous ${action} le compte de ${user.full_name} ?`)) {
      return
    }
    try {
      await toggleUserStatus(user.id)
      setToast({
        type: 'success',
        text: `Le compte a été ${user.is_active ? 'désactivé' : 'activé'}.`,
      })
      await loadUsers()
    } catch (actionError) {
      console.error('handleToggleStatus:', actionError)
      setToast({
        type: 'error',
        text: `La modification du statut a échoué : ${errorMessage(actionError)}`,
      })
    }
  }

  async function handleDelete(user: User) {
    if (!window.confirm(`Supprimer définitivement "${user.full_name}" ?`)) {
      return
    }
    try {
      await deleteUser(user.id)
      setToast({ type: 'success', text: 'Le compte a été supprimé.' })
      await loadUsers()
    } catch (actionError) {
      console.error('handleDelete:', actionError)
      setToast({
        type: 'error',
        text: `La suppression a échoué : ${errorMessage(actionError)}`,
      })
    }
  }

  async function openUserDetails(user: User) {
    setSelectedUser(null)
    setDetailError(null)
    setActionData(null)
    setDetailLoading(true)
    try {
      setSelectedUser(await getUserById(user.id))
    } catch (detailLoadError) {
      console.error('openUserDetails:', detailLoadError)
      setDetailError(errorMessage(detailLoadError))
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleUserAdminAction(action: UserAdminAction) {
    if (!selectedUser) return

    const confirmations: Partial<Record<UserAdminAction, string>> = {
      'reset-password': `Demander une réinitialisation du mot de passe pour ${selectedUser.full_name} ?`,
      ban: `Bannir ${selectedUser.full_name} ?`,
      unban: `Débannir ${selectedUser.full_name} ?`,
      'force-logout': `Forcer la déconnexion de ${selectedUser.full_name} ?`,
    }
    const confirmation = confirmations[action]
    if (confirmation && !window.confirm(confirmation)) return

    const actionLabels: Record<UserAdminAction, string> = {
      'reset-password': 'Réinitialisation du mot de passe',
      ban: 'Bannissement',
      unban: 'Débannissement',
      'force-logout': 'Déconnexion forcée',
      activity: 'Activité récente',
      sessions: 'Sessions actives',
      'login-history': 'Historique de connexion',
    }

    setActionLoading(action)
    setActionData(null)
    try {
      let result: unknown
      switch (action) {
        case 'reset-password':
          result = await resetUserPassword(selectedUser.id)
          break
        case 'ban':
          result = await banUser(selectedUser.id)
          break
        case 'unban':
          result = await unbanUser(selectedUser.id)
          break
        case 'force-logout':
          result = await forceUserLogout(selectedUser.id)
          break
        case 'activity':
          result = await getUserActivity(selectedUser.id)
          break
        case 'sessions':
          result = await getUserSessions(selectedUser.id)
          break
        case 'login-history':
          result = await getUserLoginHistory(selectedUser.id)
          break
      }

      setActionData({ title: actionLabels[action], value: result })
      setToast({
        type: 'success',
        text: `${actionLabels[action]} : opération effectuée.`,
      })
      if (action === 'ban' || action === 'unban') {
        await loadUsers()
        setSelectedUser(await getUserById(selectedUser.id))
      }
    } catch (actionError) {
      console.error(`handleUserAdminAction (${action}):`, actionError)
      const message = getAdminApiErrorMessage(actionError)
      if (message === 'Fonctionnalité bientôt disponible') {
        setToast({ type: 'info', text: message })
      } else {
        setToast({
          type: 'error',
          text: `${actionLabels[action]} : ${message}`,
        })
      }
    } finally {
      setActionLoading(null)
    }
  }

  function getRoleBadge(role: string) {
    return (
      ROLES.find((item) => item.value === role) ?? {
        label: role,
        color: 'bg-gray-100 text-gray-700',
      }
    )
  }

  return (
    <div className="space-y-6">
      <AdminToast message={toast} onDismiss={() => setToast(null)} />
      <UserDetailModal
        actionData={actionData}
        actionLoading={actionLoading}
        error={detailError}
        isOpen={detailLoading || selectedUser !== null || detailError !== null}
        loading={detailLoading}
        onAction={(action) => void handleUserAdminAction(action)}
        onClose={() => {
          setSelectedUser(null)
          setDetailError(null)
          setActionData(null)
        }}
        user={selectedUser}
      />

      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Utilisateurs
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Consultez les profils et gérez les accès de la plateforme.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="sr-only" htmlFor="user-search">
            Rechercher un utilisateur
          </label>
          <input
            autoComplete="off"
            className="rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:text-white"
            id="user-search"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Rechercher par nom ou courriel…"
            type="search"
            value={search}
          />
          <label className="sr-only" htmlFor="user-role-filter">
            Filtrer par rôle
          </label>
          <select
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            id="user-role-filter"
            onChange={(event) => {
              setRoleFilter(event.target.value)
              setPage(1)
            }}
            value={roleFilter}
          >
            <option value="">Tous les rôles</option>
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="user-status-filter">
            Filtrer par statut
          </label>
          <select
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            id="user-status-filter"
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setPage(1)
            }}
            value={statusFilter}
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>

        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Les filtres transmis au serveur sont la recherche, le rôle et le
          statut. Le filtrage par date d’inscription n’est pas exposé par le
          contrat API actuel.
        </p>

        {error && (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            role="alert"
          >
            <span>Impossible de charger les utilisateurs : {error}</span>
            <button
              className="font-semibold underline underline-offset-2"
              onClick={() => void loadUsers()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div
            aria-label="Chargement des utilisateurs"
            className="flex justify-center py-12"
            role="status"
          >
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucun utilisateur ne correspond à ces filtres.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-start">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
                  <th className="pb-3 pe-4 font-medium">Utilisateur</th>
                  <th className="pb-3 pe-4 font-medium">Rôle</th>
                  <th className="pb-3 pe-4 font-medium">Statut</th>
                  <th className="pb-3 pe-4 font-medium">Ville</th>
                  <th className="pb-3 pe-4 font-medium">Inscription</th>
                  <th className="pb-3 text-end font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const role = getRoleBadge(user.role)
                  return (
                    <tr
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                      key={user.id}
                    >
                      <td className="py-3 pe-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              alt=""
                              className="h-9 w-9 rounded-full object-cover"
                              loading="lazy"
                              src={user.avatar_url}
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                              {user.full_name.trim().charAt(0).toLocaleUpperCase('fr') ||
                                '?'}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {user.full_name}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pe-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${role.color}`}
                        >
                          {role.label}
                        </span>
                      </td>
                      <td className="py-3 pe-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.is_active
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                          }`}
                        >
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 pe-4 text-sm text-gray-500 dark:text-gray-400">
                        {user.city || '—'}
                      </td>
                      <td className="whitespace-nowrap py-3 pe-4 text-sm text-gray-500 dark:text-gray-400">
                        {Number.isNaN(Date.parse(user.created_at))
                          ? 'Date inconnue'
                          : new Intl.DateTimeFormat('fr-FR', {
                              dateStyle: 'medium',
                            }).format(new Date(user.created_at))}
                      </td>
                      <td className="py-3 text-end">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-gray-700 dark:text-gray-200"
                            onClick={() => void openUserDetails(user)}
                            type="button"
                          >
                            Profil
                          </button>
                          <select
                            aria-label={`Changer le rôle de ${user.full_name}`}
                            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            onChange={(event) =>
                              void handleRoleChange(user, event.target.value)
                            }
                            value={user.role}
                          >
                            {ROLES.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <button
                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                            onClick={() => void handleToggleStatus(user)}
                            type="button"
                          >
                            {user.is_active ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                            onClick={() => void handleDelete(user)}
                            type="button"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} sur {totalPages}
            </span>
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              type="button"
            >
              Suivant
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
