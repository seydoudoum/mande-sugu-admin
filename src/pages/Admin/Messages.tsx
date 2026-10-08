import AdminDataPanel from '../../components/admin/AdminDataPanel'
import AdminResourceActions from '../../components/admin/AdminResourceActions'
import {
  getAdminMessage,
  getAdminMessages,
  getFlaggedAdminMessages,
  replyToAdminMessage,
} from '../../api/admin-extended'

export default function AdminMessages() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Messagerie et modération
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Consultez les conversations et les signalements exposés par l’API.
        </p>
      </header>
      <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
        Les routes de modération sont annoncées comme non encore implémentées.
        Aucun message n’est envoyé sans payload JSON explicite; les réponses
        404 affichent le toast « Fonctionnalité bientôt disponible ».
      </p>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminDataPanel
          description="Toutes les conversations administrables."
          loadData={getAdminMessages}
          title="Conversations"
        />
        <AdminDataPanel
          description="Conversations retournées par le filtre de signalement."
          loadData={getFlaggedAdminMessages}
          title="Conversations signalées"
        />
      </section>
      <AdminResourceActions
        actions={[
          { key: 'details', label: 'Lire la conversation', execute: getAdminMessage },
          {
            key: 'reply',
            label: 'Envoyer la réponse',
            requiresPayload: true,
            execute: replyToAdminMessage,
          },
        ]}
        description="Le schéma d’une réponse n’étant pas documenté, saisissez le corps JSON attendu par le backend."
        idLabel="Identifiant de la conversation"
        title="Détail et réponse"
      />
    </div>
  )
}
