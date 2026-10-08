import type { DashboardProduct } from '@/api/admin'
import { BoxIcon } from '@/icons'
import { formatCurrency } from './dashboardUtils'

interface TopProductsProps {
  products: DashboardProduct[]
}

const rankStyles = [
  'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
]

export default function TopProducts({ products }: TopProductsProps) {
  const maximumSales = Math.max(...products.map((product) => product.sales_count), 1)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top 5 produits
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Les meilleures ventes de la plateforme
        </p>
      </div>
      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Aucune donnée disponible
        </p>
      ) : (
        <div className="space-y-4">
          {products.slice(0, 5).map((product, index) => (
            <div className="flex items-center gap-3" key={product.id}>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  rankStyles[index] ??
                  'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                }`}
              >
                {index + 1}
              </span>
              {product.main_image ? (
                <img
                  alt={product.name}
                  className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                  src={product.main_image}
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-white/10">
                  <BoxIcon className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    aria-label={`${product.sales_count} ventes`}
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                    role="progressbar"
                    aria-valuemax={maximumSales}
                    aria-valuemin={0}
                    aria-valuenow={product.sales_count}
                  >
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{
                        width: `${Math.min(
                          (product.sales_count / maximumSales) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {product.sales_count} ventes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
