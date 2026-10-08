import AdminDataPanel from '../../components/admin/AdminDataPanel'
import AdminResourceActions from '../../components/admin/AdminResourceActions'
import {
  getAdminSeller,
  getAdminSellerStats,
  getAdminSellers,
  updateAdminSellerStatus,
  verifyAdminSeller,
} from '../../api/admin-extended'

export default function AdminSellers() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Vendeurs
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Liste, vérification et informations vendeur via les routes prévues.
        </p>
      </header>
      <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
        Ces routes sont marquées non implémentées dans API.md. Une réponse 404
        affiche un toast « Fonctionnalité bientôt disponible ». Pour le statut,
        le backend ne documente pas les champs du corps : saisissez son JSON
        contractuel.
      </p>
      <AdminDataPanel
        description="Liste retournée par le endpoint d’administration."
        loadData={getAdminSellers}
        title="Liste des vendeurs"
      />
      <AdminResourceActions
        actions={[
          { key: 'details', label: 'Voir le profil', execute: getAdminSeller },
          { key: 'stats', label: 'Voir les statistiques', execute: getAdminSellerStats },
          {
            key: 'verify',
            label: 'Vérifier le vendeur',
            confirm: (id) => `Envoyer la demande de vérification pour le vendeur #${id} ?`,
            execute: verifyAdminSeller,
          },
          {
            key: 'status',
            label: 'Modifier le statut',
            requiresPayload: true,
            execute: updateAdminSellerStatus,
          },
        ]}
        description="Les réponses sont affichées telles que retournées par le serveur."
        idLabel="Identifiant du vendeur"
        title="Actions vendeur"
      />
    </div>
  )
}
