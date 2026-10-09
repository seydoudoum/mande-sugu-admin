import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router'
import { getProducts, type Product } from '@/api/admin-products'
import { getUsers, type User } from '@/api/admin-users'
import api from '@/api/client'
import Modal from '@/components/admin/Modal'
import { useDebounce } from '@/hooks/useDebounce'
import { useKeyboard } from '@/hooks/useKeyboard'
import { BoxIcon, CartIcon, GroupIcon, SearchIcon } from '@/icons'

type SearchCategory = 'users' | 'products' | 'orders'

interface SearchResult {
  id: string
  category: SearchCategory
  title: string
  description: string
  href: string
}

interface SearchOrder {
  id: number
  order_number: string
  buyer_name?: string | null
  status?: string
}

interface SearchOrderResponse {
  data: SearchOrder[]
}

const categoryLabels: Record<SearchCategory, string> = {
  users: 'Utilisateurs',
  products: 'Produits',
  orders: 'Commandes',
}

const categoryIcons = {
  users: GroupIcon,
  products: BoxIcon,
  orders: CartIcon,
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export default function SearchModal() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const requestIdRef = useRef(0)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const debouncedQuery = useDebounce(query, 300)
  const openModal = useCallback(() => {
    setQuery('')
    setResults([])
    setSearchError(null)
    setLoading(false)
    setActiveIndex(0)
    setIsOpen(true)
  }, [])

  useKeyboard(
    openModal,
    { key: 'k', meta: true }
  )
  useKeyboard(
    openModal,
    { key: 'k', ctrl: true }
  )
  useKeyboard(
    () => {
      setIsOpen(false)
    },
    { key: 'Escape', enabled: isOpen }
  )

  useEffect(() => {
    if (!isOpen) return
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [isOpen])

  useEffect(() => {
    window.addEventListener('mande-sugu:open-search', openModal)
    return () => window.removeEventListener('mande-sugu:open-search', openModal)
  }, [openModal])

  useEffect(() => {
    const term = normalizeSearch(debouncedQuery)
    const requestId = ++requestIdRef.current

    if (!isOpen || !term) {
      return
    }

    const userRequest = getUsers({ page: 1, limit: 5, search: debouncedQuery })
    const productRequest = getProducts({
      page: 1,
      limit: 5,
      search: debouncedQuery,
    })
    const orderRequest = api.get<SearchOrderResponse>('/admin/orders', {
      params: { page: 1, limit: 5, search: debouncedQuery },
    })

    void Promise.allSettled([userRequest, productRequest, orderRequest]).then(
      ([usersResult, productsResult, ordersResult]) => {
        if (requestId !== requestIdRef.current) return

        const nextResults: SearchResult[] = []
        const errors: unknown[] = []

        if (usersResult.status === 'fulfilled') {
          nextResults.push(
            ...usersResult.value.data.slice(0, 5).map((user: User) => ({
              id: `user-${user.id}`,
              category: 'users' as const,
              title: user.full_name,
              description: user.email,
              href: '/users',
            }))
          )
        } else {
          errors.push(usersResult.reason)
        }

        if (productsResult.status === 'fulfilled') {
          nextResults.push(
            ...productsResult.value.data
              .slice(0, 5)
              .map((product: Product) => ({
                id: `product-${product.id}`,
                category: 'products' as const,
                title: product.name,
                description: `Produit n° ${product.id}`,
                href: '/products',
              }))
          )
        } else {
          errors.push(productsResult.reason)
        }

        if (ordersResult.status === 'fulfilled') {
          nextResults.push(
            ...ordersResult.value.data.data.slice(0, 5).map((order) => ({
              id: `order-${order.id}`,
              category: 'orders' as const,
              title: `Commande ${order.order_number}`,
              description: order.buyer_name ?? `Commande n° ${order.id}`,
              href: '/orders',
            }))
          )
        } else {
          errors.push(ordersResult.reason)
        }

        errors.forEach((error) => console.error('SearchModal search:', error))
        setResults(nextResults)
        setSearchError(
          errors.length === 3
            ? 'La recherche est momentanément indisponible.'
            : errors.length > 0
              ? 'Certaines catégories n’ont pas pu être chargées.'
              : null
        )
        setActiveIndex(0)
        setLoading(false)
      }
    )

    return () => {
      requestIdRef.current += 1
    }
  }, [debouncedQuery, isOpen])

  function closeModal() {
    setIsOpen(false)
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    setLoading(value.trim().length > 0)
    setSearchError(null)
    if (!normalizeSearch(value)) {
      requestIdRef.current += 1
      setResults([])
      setSearchError(null)
      setLoading(false)
      setActiveIndex(0)
    }
  }

  function openResult(result: SearchResult | undefined) {
    if (!result) return
    setIsOpen(false)
    navigate(result.href)
  }

  function handleResultKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      openResult(results[activeIndex])
    }
  }

  const noResults =
    !loading && !searchError && normalizeSearch(debouncedQuery).length > 0 && results.length === 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      titleId="global-search-title"
      className="p-0"
      showCloseButton={false}
    >
      <div onKeyDown={handleResultKeyDown}>
        <h2 className="sr-only" id="global-search-title">
          Recherche globale
        </h2>
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 dark:border-gray-800">
          <SearchIcon
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-gray-400"
          />
          <input
            aria-label="Recherche globale"
            aria-controls="global-search-results"
            autoComplete="off"
            className="h-16 min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Rechercher utilisateurs, produits, commandes..."
            ref={inputRef}
            role="combobox"
            aria-expanded={results.length > 0}
            value={query}
          />
          <button
            aria-label="Fermer la recherche"
            className="rounded border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-gray-700 dark:text-gray-300"
            onClick={closeModal}
            type="button"
          >
            ESC
          </button>
        </div>

        <div
          aria-label="Résultats de recherche"
          className="max-h-[min(60vh,32rem)] overflow-y-auto p-3"
          id="global-search-results"
          role="listbox"
        >
          {loading && (
            <p
              aria-live="polite"
              className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              role="status"
            >
              Recherche en cours…
            </p>
          )}
          {searchError && (
            <p
              className="px-3 py-4 text-center text-sm text-red-600 dark:text-red-300"
              role="alert"
            >
              {searchError}
            </p>
          )}
          {noResults && (
            <p className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Aucun résultat pour « {debouncedQuery.trim()} »
            </p>
          )}
          {!loading &&
            (['users', 'products', 'orders'] as const).map((category) => {
              const categoryResults = results.filter(
                (result) => result.category === category
              )
              if (categoryResults.length === 0) return null
              const Icon = categoryIcons[category]

              return (
                <section aria-label={categoryLabels[category]} key={category}>
                  <h3 className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <span className="flex items-center gap-2">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      {categoryLabels[category]}
                    </span>
                  </h3>
                  <ul>
                    {categoryResults.map((result) => {
                      const resultIndex = results.indexOf(result)
                      return (
                        <li key={result.id}>
                          <button
                            aria-selected={activeIndex === resultIndex}
                            className={`flex w-full flex-col rounded-xl px-3 py-2.5 text-start transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-500 ${
                              activeIndex === resultIndex
                                ? 'bg-orange-50 dark:bg-orange-500/10'
                                : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                            }`}
                            onClick={() => openResult(result)}
                            role="option"
                            type="button"
                          >
                            <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                              {result.title}
                            </span>
                            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {result.description}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })}
        </div>
        <footer className="flex items-center justify-end border-t border-gray-200 px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          ESC pour fermer · ENTRÉE pour ouvrir
        </footer>
      </div>
    </Modal>
  )
}
