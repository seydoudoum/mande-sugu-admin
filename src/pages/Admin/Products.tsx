import { useCallback, useEffect, useState } from 'react'
import {
  deleteProduct,
  getProducts,
  updateProductStatus,
  type Product,
} from '../../api/admin-products'
import AdminToast, {
  type ToastMessage,
} from '../../components/admin/AdminToast'
import { RefreshIcon } from '../../icons'

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.'
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getProducts({
        page,
        limit: 20,
        search: search.trim() || undefined,
      })
      setProducts(response.data)
      setTotal(response.pagination.total)
      setTotalPages(Math.max(1, response.pagination.totalPages))
    } catch (loadError) {
      console.error('loadProducts:', loadError)
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProducts(), 250)
    return () => window.clearTimeout(timer)
  }, [loadProducts])

  async function handleToggleStatus(product: Product) {
    const nextActiveState = !product.is_active
    const action = nextActiveState ? 'activer' : 'désactiver'
    if (
      !window.confirm(
        `Voulez-vous ${action} le produit « ${product.name} » ?`
      )
    ) {
      return
    }
    try {
      await updateProductStatus(product.id, Boolean(nextActiveState))
      setToast({
        type: 'success',
        text: `Le produit a été ${nextActiveState ? 'activé' : 'désactivé'}.`,
      })
      await loadProducts()
    } catch (actionError) {
      console.error('handleToggleStatus:', actionError)
      setToast({
        type: 'error',
        text: `La modification du statut a échoué : ${errorMessage(actionError)}`,
      })
    }
  }

  async function handleDelete(product: Product) {
    if (
      !window.confirm(
        `Supprimer définitivement le produit « ${product.name} » ?`
      )
    ) {
      return
    }
    try {
      await deleteProduct(product.id)
      setToast({ type: 'success', text: 'Le produit a été supprimé.' })
      await loadProducts()
    } catch (actionError) {
      console.error('handleDelete:', actionError)
      setToast({
        type: 'error',
        text: `La suppression a échoué : ${errorMessage(actionError)}`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <AdminToast message={toast} onDismiss={() => setToast(null)} />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Produits
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Recherchez, modérez et gérez les produits de la marketplace.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-orange-500"
          disabled={loading}
          onClick={() => void loadProducts()}
          type="button"
        >
          <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </header>

      <section
        aria-label="Statistiques des produits"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          { label: 'Produits trouvés', value: total, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Actifs sur cette page', value: products.filter((product) => product.is_active).length, color: 'text-green-600 dark:text-green-400' },
          { label: 'Stock faible sur cette page', value: products.filter((product) => product.stock < 5).length, color: 'text-orange-600 dark:text-orange-400' },
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

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="product-search">
            Rechercher un produit
          </label>
          <input
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:text-white"
            id="product-search"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Rechercher un produit…"
            type="search"
            value={search}
          />
        </div>
        {error && (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            role="alert"
          >
            <span>Impossible de charger les produits : {error}</span>
            <button
              className="font-semibold underline underline-offset-2"
              onClick={() => void loadProducts()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div
            aria-label="Chargement des produits"
            className="flex justify-center py-12"
            role="status"
          >
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucun produit ne correspond à cette recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-start">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
                  <th className="pb-3 pe-4 font-medium">Produit</th>
                  <th className="pb-3 pe-4 font-medium">Vendeur</th>
                  <th className="pb-3 pe-4 font-medium">Prix</th>
                  <th className="pb-3 pe-4 font-medium">Stock</th>
                  <th className="pb-3 pe-4 font-medium">Statut</th>
                  <th className="pb-3 text-end font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                    key={product.id}
                  >
                    <td className="py-3 pe-4">
                      <div className="flex items-center gap-3">
                        {product.main_image ? (
                          <img
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            loading="lazy"
                            src={product.main_image}
                          />
                        ) : (
                          <span className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800" />
                        )}
                        <span className="max-w-64 truncate text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pe-4 text-sm text-gray-600 dark:text-gray-300">
                      {product.seller_name || `#${product.seller_id}`}
                    </td>
                    <td className="whitespace-nowrap py-3 pe-4 text-sm text-gray-700 dark:text-gray-300">
                      {Number(product.price).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 pe-4 text-sm">
                      <span
                        className={
                          product.stock < 5
                            ? 'font-semibold text-red-600 dark:text-red-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 pe-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                        }`}
                      >
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                          onClick={() => void handleToggleStatus(product)}
                          type="button"
                        >
                          {product.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                          onClick={() => void handleDelete(product)}
                          type="button"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
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
