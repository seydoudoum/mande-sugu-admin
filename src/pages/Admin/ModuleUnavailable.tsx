import { Link } from 'react-router'

interface ModuleUnavailableProps {
  title: string
  description: string
  requiredContract: string
}

export default function ModuleUnavailable({
  title,
  description,
  requiredContract,
}: ModuleUnavailableProps) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </header>
      <section className="rounded-2xl border border-orange-200 bg-white p-6 shadow-theme-xs dark:border-orange-500/20 dark:bg-white/[0.03] sm:p-8">
        <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-500/15 dark:text-orange-300">
          Module non connecté
        </span>
        <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          Cette fonctionnalité nécessite une API backend
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          Aucune donnée ni action n’est simulée. Le dépôt ne contient pas
          d’endpoint confirmé pour ce module; connectez son contrat backend
          avant d’activer les opérations d’administration.
        </p>
        <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Contrat requis
          </p>
          <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
            {requiredContract}
          </p>
        </div>
        <Link
          className="mt-6 inline-flex rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          to="/"
        >
          Retour au dashboard
        </Link>
      </section>
    </div>
  )
}
