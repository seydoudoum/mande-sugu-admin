import AdminDataPanel from '../../components/admin/AdminDataPanel'
import AdminResourceActions from '../../components/admin/AdminResourceActions'
import {
  assignAdminTicket,
  closeAdminTicket,
  getAdminTicket,
  getAdminTickets,
  resolveAdminTicket,
} from '../../api/admin-extended'

export default function AdminSupport() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Support et tickets
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Consultation et traitement des tickets par les routes prévues.
        </p>
      </header>
      <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
        Le format des corps pour assigner, résoudre ou fermer un ticket n’est
        pas décrit dans API.md. Ces actions exigent un JSON explicite. Une
        réponse 404 affiche « Fonctionnalité bientôt disponible ».
      </p>
      <AdminDataPanel
        description="Liste des tickets fournie par le backend."
        loadData={getAdminTickets}
        title="Tickets"
      />
      <AdminResourceActions
        actions={[
          { key: 'details', label: 'Voir le ticket', execute: getAdminTicket },
          {
            key: 'assign',
            label: 'Assigner',
            requiresPayload: true,
            execute: assignAdminTicket,
          },
          {
            key: 'resolve',
            label: 'Résoudre',
            requiresPayload: true,
            execute: resolveAdminTicket,
          },
          {
            key: 'close',
            label: 'Fermer',
            requiresPayload: true,
            confirm: (id) => `Fermer le ticket #${id} ?`,
            execute: closeAdminTicket,
          },
        ]}
        description="Les réponses sont présentées sans supposer de schéma de ticket."
        idLabel="Identifiant du ticket"
        title="Détail et actions sur ticket"
      />
    </div>
  )
}
