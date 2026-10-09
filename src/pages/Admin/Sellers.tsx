import { useCallback, useEffect, useState } from 'react'
import api from '../../api/client'
import { RefreshIcon } from '../../icons'

interface Seller {
  id: number
  user_id: number
  shop_name: string
  shop_slug: string
  description: string | null
  country_code: string | null
  city: string | null
  whatsapp_number: string | null
  is_verified: number
  rating: number
  user: {
    id: number
    full_name: string
    email: string
    phone: string | null
    avatar_url: string | null
    is_active: number
    created_at: string
  }
  stats: {
    total_products: number
    total_sales: number
    total_revenue: number
  }
}

interface SellersResponse {
  success: boolean
  data: Seller[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.'
}

function formatCurrency(value: number): string {
  return `${Number(value).toLocaleString('fr-FR', {
    maximumFractionDigits: 0,
  })} FCFA`
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date)
}

export default function AdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [search, setSearch] = useState('')
  const [verified, setVerified] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSellers = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const response = await api.get<SellersResponse>('/admin/sellers', {
        params: {
          page,
          limit: 20,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(verified !== '' ? { verified } : {}),
        },
      })
      setSellers(response.data.data)
      setTotal(response.data.pagination.total)
      setTotalPages(Math.max(1, response.data.pagination.totalPages))
    } catch (loadError) {
      console.error('loadAdminSellers:', loadError)
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, search, verified])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSellers(), 250)
    return () => window.clearTimeout(timer)
  }, [loadSellers])

  const verifiedOnPage = sellers.filter((seller) => seller.is_verified === 1).length
  const salesOnPage = sellers.reduce(
    (sum, seller) => sum + Number(seller.stats.total_sales || 0),
    0
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Vendeurs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Suivez les boutiques, leur activité et leur vérification.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
          disabled={refreshing}
          onClick={() => void loadSellers()}
          type="button"
        >
          <RefreshIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </header>

      <section
        aria-label="Statistiques des vendeurs"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          { label: 'Vendeurs au total', value: total, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Vérifiés sur cette page', value: verifiedOnPage, color: 'text-green-600 dark:text-green-400' },
          { label: 'Ventes sur cette page', value: salesOnPage, color: 'text-orange-600 dark:text-orange-400' },
        ].map((metric) => (
          <article
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
            key={metric.label}
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${metric.color}`}>
              {metric.value.toLocaleString('fr-FR')}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Boutiques
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {total.toLocaleString('fr-FR')} résultat{total > 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-[minmax(220px,1fr)_180px]">
              <label className="sr-only" htmlFor="seller-search">
                Rechercher une boutique ou un vendeur
              </label>
              <input
                autoComplete="off"
                className="rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:text-white"
                id="seller-search"
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Rechercher une boutique…"
                type="search"
                value={search}
              />
              <label className="sr-only" htmlFor="seller-verified-filter">
                Filtrer par vérification
              </label>
              <select
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                id="seller-verified-filter"
                onChange={(event) => {
                  setVerified(event.target.value)
                  setPage(1)
                }}
                value={verified}
              >
                <option value="">Tous les vendeurs</option>
                <option value="1">Vérifiés</option>
                <option value="0">À vérifier</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="m-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            role="alert"
          >
            <span>Impossible de charger les vendeurs : {error}</span>
            <button
              className="font-semibold underline underline-offset-2"
              onClick={() => void loadSellers()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div
            aria-label="Chargement des vendeurs"
            className="flex justify-center py-16"
            role="status"
          >
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : sellers.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucun vendeur ne correspond à ces filtres.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-start">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <th className="px-5 py-3 font-medium">Boutique</th>
                    <th className="px-5 py-3 font-medium">Propriétaire</th>
                    <th className="px-5 py-3 font-medium">Activité</th>
                    <th className="px-5 py-3 font-medium">Chiffre d’affaires</th>
                    <th className="px-5 py-3 font-medium">Note</th>
                    <th className="px-5 py-3 font-medium">Vérification</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                      key={seller.id}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {seller.shop_name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {seller.city || seller.country_code || 'Localisation inconnue'}
                          <span className="px-1.5 text-gray-300">·</span>
                          Depuis {formatDate(seller.user.created_at)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {seller.user.full_name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {seller.user.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {seller.stats.total_sales.toLocaleString('fr-FR')} ventes
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {seller.stats.total_products.toLocaleString('fr-FR')} produits
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(seller.stats.total_revenue)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-amber-500">★</span>{' '}
                        {Number(seller.rating).toLocaleString('fr-FR', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            seller.is_verified
                              ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                              : 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
                          }`}
                        >
                          {seller.is_verified ? 'Vérifié' : 'À vérifier'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  type="button"
                >
                  Précédent
                </button>
                <button
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                  type="button"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
