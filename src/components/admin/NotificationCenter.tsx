import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import api from '@/api/client'
import { useNotificationsStore, type AdminNotification } from '@/stores/notificationsStore'
import {
  AlertIcon,
  BellAltIcon,
  CartIcon,
  DollarIcon,
  InfoIcon,
  UserIcon,
} from '@/icons'

interface ApiNotification {
  id: number | string
  type: string
  title: string
  body?: string | null
  data?: unknown
  is_read: number | boolean
  created_at: string
}

interface NotificationsResponse {
  data: ApiNotification[]
}

type NotificationFilter = 'all' | 'unread'
type NotificationIconType = AdminNotification['category']

const notificationStyles: Record<NotificationIconType, string> = {
  order: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  user: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  dispute: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  payment: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  stock: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  system: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
}

const notificationIcons = {
  order: CartIcon,
  user: UserIcon,
  dispute: AlertIcon,
  payment: DollarIcon,
  stock: AlertIcon,
  system: InfoIcon,
}

function notificationCategory(type: string): NotificationIconType {
  const normalizedType = type.toLocaleLowerCase()
  if (normalizedType.includes('order') || normalizedType.includes('commande')) {
    return 'order'
  }
  if (normalizedType.includes('user') || normalizedType.includes('utilisateur')) {
    return 'user'
  }
  if (normalizedType.includes('dispute') || normalizedType.includes('litige')) {
    return 'dispute'
  }
  if (normalizedType.includes('payment') || normalizedType.includes('paiement')) {
    return 'payment'
  }
  if (normalizedType.includes('stock')) return 'stock'
  return 'system'
}

function notificationHref(notification: ApiNotification): string | undefined {
  let data = notification.data
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data) as unknown
    } catch (error) {
      console.error('NotificationCenter invalid notification data:', error)
      return undefined
    }
  }

  if (data && typeof data === 'object' && 'href' in data) {
    const href = data.href
    if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
      return href
    }
  }

  const category = notificationCategory(notification.type)
  if (category === 'order') return '/orders'
  if (category === 'user') return '/users'
  if (category === 'dispute') return '/messages'
  if (category === 'payment') return '/finance'
  return '/notifications'
}

function relativeTimestamp(timestamp: string): string {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  )
  if (!Number.isFinite(elapsedSeconds)) return 'Date inconnue'
  if (elapsedSeconds < 60) return 'à l’instant'
  if (elapsedSeconds < 3600) {
    const minutes = Math.floor(elapsedSeconds / 60)
    return `il y a ${minutes} min`
  }
  if (elapsedSeconds < 86400) {
    const hours = Math.floor(elapsedSeconds / 3600)
    return `il y a ${hours} h`
  }
  const days = Math.floor(elapsedSeconds / 86400)
  return `il y a ${days} j`
}

export default function NotificationCenter() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const notifications = useNotificationsStore((state) => state.notifications)
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const setNotifications = useNotificationsStore((state) => state.setNotifications)
  const markAsRead = useNotificationsStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadNotifications() {
      try {
        const response = await api.get<NotificationsResponse>('/notifications', {
          params: { limit: 10 },
        })
        if (!isActive) return

        const existingReadState = new Map(
          useNotificationsStore
            .getState()
            .notifications.map((notification) => [
              notification.id,
              notification.isRead,
            ])
        )
        const items: AdminNotification[] = response.data.data.map((item) => {
          const id = String(item.id)
          return {
            id,
            title: item.title,
            message: item.body ?? '',
            category: notificationCategory(item.type),
            createdAt: item.created_at,
            isRead: Boolean(item.is_read) || existingReadState.get(id) === true,
            href: notificationHref(item),
          }
        })
        setNotifications(items)
        setError(null)
      } catch (loadError) {
        console.error('NotificationCenter loadNotifications:', loadError)
        if (isActive) setError('Impossible de charger les notifications.')
      } finally {
        if (isActive) setLoading(false)
      }
    }

    void loadNotifications()
    const intervalId = window.setInterval(() => void loadNotifications(), 30_000)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [setNotifications])

  useEffect(() => {
    if (!isOpen) return

    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  async function handleMarkAsRead(notification: AdminNotification) {
    if (!notification.isRead) {
      try {
        await api.put(`/notifications/${encodeURIComponent(notification.id)}/read`)
        markAsRead(notification.id)
      } catch (actionError) {
        console.error('NotificationCenter markAsRead:', actionError)
        setError('Impossible de marquer cette notification comme lue.')
        return
      }
    }
    setIsOpen(false)
    if (notification.href) navigate(notification.href)
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) return
    try {
      await api.put('/notifications/read-all')
      markAllAsRead()
    } catch (actionError) {
      console.error('NotificationCenter markAllAsRead:', actionError)
      setError('Impossible de marquer toutes les notifications comme lues.')
    }
  }

  const visibleNotifications = notifications
    .slice(0, 10)
    .filter((notification) => filter === 'all' || !notification.isRead)

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ''}`}
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <BellAltIcon aria-hidden="true" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          aria-label="Centre de notifications"
          className="absolute inset-e-0 top-full z-50 mt-3 flex max-h-[min(32rem,calc(100vh-6rem))] w-[min(23.75rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900"
        >
          <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-800">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            </div>
            <button
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
              disabled={unreadCount === 0}
              onClick={() => void handleMarkAllAsRead()}
              type="button"
            >
              Tout marquer comme lu
            </button>
          </header>

          <div
            aria-label="Filtrer les notifications"
            className="flex gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800"
            role="tablist"
          >
            {([
              ['all', 'Toutes'],
              ['unread', 'Non lues'],
            ] as const).map(([value, label]) => (
              <button
                aria-selected={filter === value}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                  filter === value
                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.03]'
                }`}
                key={value}
                onClick={() => setFilter(value)}
                role="tab"
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <p className="px-4 py-3 text-sm text-red-600 dark:text-red-300" role="alert">
              {error}
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p
                aria-live="polite"
                className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                role="status"
              >
                Chargement…
              </p>
            ) : visibleNotifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                Aucune notification
              </p>
            ) : (
              <ul>
                {visibleNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.category]
                  return (
                    <li key={notification.id}>
                      <button
                        className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-start transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-orange-500 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                        onClick={() => void handleMarkAsRead(notification)}
                        type="button"
                      >
                        <span
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notificationStyles[notification.category]}`}
                        >
                          <Icon aria-hidden="true" className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                              {notification.title}
                            </span>
                            {!notification.isRead && (
                              <span
                                aria-label="Non lue"
                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                              />
                            )}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-xs text-gray-500 dark:text-gray-400">
                            {notification.message}
                          </span>
                          <span className="mt-1.5 block text-[11px] text-gray-400 dark:text-gray-500">
                            {relativeTimestamp(notification.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <footer className="border-t border-gray-100 p-3 dark:border-gray-800">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
              onClick={() => {
                setIsOpen(false)
                navigate('/notifications')
              }}
              type="button"
            >
              Voir toutes les notifications
            </button>
          </footer>
        </section>
      )}
    </div>
  )
}
