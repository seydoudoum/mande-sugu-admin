import AdminDataPanel from '../../components/admin/AdminDataPanel'
import AdminJsonAction from '../../components/admin/AdminJsonAction'
import {
  blockAdminIp,
  getAdminSessions,
  getFailedAdminLogins,
} from '../../api/admin-extended'

export default function AdminSecurity() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sécurité
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tentatives de connexion et sessions administrateur.
        </p>
      </header>
      <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
        Les routes sont prévues comme non encore implémentées. Les requêtes sont
        envoyées au backend et une réponse 404 affiche « Fonctionnalité bientôt
        disponible ». Le corps requis pour bloquer une IP n’étant pas précisé,
        saisissez le JSON exact attendu par votre serveur.
      </p>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminDataPanel
          description="Événements de connexion refusés fournis par le backend."
          loadData={getFailedAdminLogins}
          title="Tentatives échouées"
        />
        <AdminDataPanel
          description="Sessions actives des administrateurs."
          loadData={getAdminSessions}
          title="Sessions actives"
        />
      </section>
      <AdminJsonAction
        buttonLabel="Envoyer la demande de blocage"
        confirmMessage="Envoyer cette requête de blocage d’adresse IP au backend ?"
        description="Aucun champ de requête n’étant documenté, le payload JSON n’est pas prérempli."
        execute={blockAdminIp}
        payloadLabel="Corps JSON défini par le backend"
        title="Bloquer une adresse IP"
      />
    </div>
  )
}
