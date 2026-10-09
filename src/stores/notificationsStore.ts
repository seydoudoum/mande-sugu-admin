import { create } from 'zustand'

export type NotificationCategory =
  | 'order'
  | 'user'
  | 'dispute'
  | 'stock'
  | 'payment'
  | 'system'

export interface AdminNotification {
  id: string
  title: string
  message: string
  category: NotificationCategory
  createdAt: string
  isRead: boolean
  href?: string
}

interface NotificationsState {
  notifications: AdminNotification[]
  unreadCount: number
  addNotification: (
    notification: Omit<AdminNotification, 'id' | 'createdAt' | 'isRead'> &
      Partial<Pick<AdminNotification, 'id' | 'createdAt' | 'isRead'>>
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setNotifications: (notifications: AdminNotification[]) => void
}

const MAX_NOTIFICATIONS = 100

function withUnreadCount(notifications: AdminNotification[]) {
  const visibleNotifications = notifications.slice(0, MAX_NOTIFICATIONS)
  return {
    notifications: visibleNotifications,
    unreadCount: visibleNotifications.filter(
      (notification) => !notification.isRead
    ).length,
  }
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => {
      const item: AdminNotification = {
        ...notification,
        id: notification.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: notification.createdAt ?? new Date().toISOString(),
        isRead: notification.isRead ?? false,
      }
      return withUnreadCount([
        item,
        ...state.notifications.filter((existing) => existing.id !== item.id),
      ])
    }),
  markAsRead: (id) =>
    set((state) =>
      withUnreadCount(
        state.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      )
    ),
  markAllAsRead: () =>
    set((state) =>
      withUnreadCount(
        state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      )
    ),
  removeNotification: (id) =>
    set((state) =>
      withUnreadCount(
        state.notifications.filter((notification) => notification.id !== id)
      )
    ),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  setNotifications: (notifications) =>
    set(() => withUnreadCount(notifications)),
}))
