import AdminDataPanel from '../../components/admin/AdminDataPanel'
import {
  getAdminAnalyticsConversion,
  getAdminAnalyticsOverview,
  getAdminAnalyticsRevenue,
  getAdminAnalyticsTraffic,
} from '../../api/admin-extended'

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Indicateurs fournis par les endpoints d’analytics de l’administration.
        </p>
      </header>
      <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
        Les routes d’analytics sont annoncées comme non encore implémentées.
        Chaque panneau interroge la route prévue et signale « Fonctionnalité
        bientôt disponible » en cas de réponse 404. Aucun graphique ni chiffre
        n’est fabriqué côté client.
      </p>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminDataPanel
          description="Vue générale de l’activité marketplace."
          loadData={getAdminAnalyticsOverview}
          title="Vue générale"
        />
        <AdminDataPanel
          description="Revenus retournés par le backend."
          loadData={getAdminAnalyticsRevenue}
          title="Revenus"
        />
        <AdminDataPanel
          description="Données de trafic disponibles côté serveur."
          loadData={getAdminAnalyticsTraffic}
          title="Trafic"
        />
        <AdminDataPanel
          description="Données de conversion disponibles côté serveur."
          loadData={getAdminAnalyticsConversion}
          title="Conversion"
        />
      </section>
    </div>
  )
}
