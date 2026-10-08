import axios from 'axios'
import api from './client'

export class AdminFeatureUnavailableError extends Error {
  constructor() {
    super('Fonctionnalité bientôt disponible')
    this.name = 'AdminFeatureUnavailableError'
  }
}

export function getAdminApiErrorMessage(error: unknown): string {
  if (error instanceof AdminFeatureUnavailableError) {
    return error.message
  }
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.'
}

async function adminRequest<T>(request: () => Promise<{ data: T }>): Promise<T> {
  try {
    const response = await request()
    const body: unknown = response.data
    if (typeof body === 'object' && body !== null && 'data' in body) {
      return body.data as T
    }
    return body as T
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new AdminFeatureUnavailableError()
    }
    throw error
  }
}

export interface AuditLogFilters {
  admin_id?: string
  action?: string
}

export async function resetUserPassword(id: number): Promise<unknown> {
  return adminRequest(() =>
    api.post<unknown>(`/admin/users/${id}/reset-password`)
  )
}

export async function banUser(id: number): Promise<unknown> {
  return adminRequest(() => api.post<unknown>(`/admin/users/${id}/ban`))
}

export async function unbanUser(id: number): Promise<unknown> {
  return adminRequest(() => api.post<unknown>(`/admin/users/${id}/unban`))
}

export async function forceUserLogout(id: number): Promise<unknown> {
  return adminRequest(() =>
    api.post<unknown>(`/admin/users/${id}/force-logout`)
  )
}

export async function getUserActivity(id: number): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>(`/admin/users/${id}/activity`)
  )
}

export async function getUserSessions(id: number): Promise<unknown> {
  return adminRequest(() => api.get<unknown>(`/admin/users/${id}/sessions`))
}

export async function getUserLoginHistory(id: number): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>(`/admin/users/${id}/login-history`)
  )
}

export async function getAdminSellers(): Promise<unknown> {
  return adminRequest(() => api.get<unknown>('/admin/sellers'))
}

export async function getAdminSeller(id: number): Promise<unknown> {
  return adminRequest(() => api.get<unknown>(`/admin/sellers/${id}`))
}

export async function verifyAdminSeller(id: number): Promise<unknown> {
  return adminRequest(() => api.put<unknown>(`/admin/sellers/${id}/verify`))
}

export async function updateAdminSellerStatus(
  id: number,
  payload: unknown
): Promise<unknown> {
  return adminRequest(() =>
    api.put<unknown>(`/admin/sellers/${id}/status`, payload)
  )
}

export async function getAdminSellerStats(id: number): Promise<unknown> {
  return adminRequest(() => api.get<unknown>(`/admin/sellers/${id}/stats`))
}

export async function refundAdminOrder(
  id: number,
  payload?: unknown
): Promise<unknown> {
  return adminRequest(() =>
    api.post<unknown>(`/admin/orders/${id}/refund`, payload)
  )
}

export async function cancelAdminOrder(id: number): Promise<unknown> {
  return adminRequest(() => api.post<unknown>(`/admin/orders/${id}/cancel`))
}

export async function getAdminOrder(id: number): Promise<unknown> {
  return adminRequest(() => api.get<unknown>(`/admin/orders/${id}`))
}

export async function getAdminOrderHistory(id: number): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>(`/admin/orders/${id}/history`)
  )
}

export async function getAdminMessages(): Promise<unknown> {
  return adminRequest(() => api.get<unknown>('/admin/messages'))
}

export async function getAdminMessage(id: number): Promise<unknown> {
  return adminRequest(() => api.get<unknown>(`/admin/messages/${id}`))
}

export async function replyToAdminMessage(
  id: number,
  payload: unknown
): Promise<unknown> {
  return adminRequest(() =>
    api.post<unknown>(`/admin/messages/${id}/reply`, payload)
  )
}

export async function getFlaggedAdminMessages(): Promise<unknown> {
  return adminRequest(() => api.get<unknown>('/admin/messages/flagged'))
}

export async function getAdminTickets(): Promise<unknown> {
  return adminRequest(() => api.get<unknown>('/admin/tickets'))
}

export async function getAdminTicket(id: number): Promise<unknown> {
  return adminRequest(() => api.get<unknown>(`/admin/tickets/${id}`))
}

export async function assignAdminTicket(
  id: number,
  payload: unknown
): Promise<unknown> {
  return adminRequest(() =>
    api.put<unknown>(`/admin/tickets/${id}/assign`, payload)
  )
}

export async function resolveAdminTicket(
  id: number,
  payload?: unknown
): Promise<unknown> {
  return adminRequest(() =>
    api.put<unknown>(`/admin/tickets/${id}/resolve`, payload)
  )
}

export async function closeAdminTicket(
  id: number,
  payload?: unknown
): Promise<unknown> {
  return adminRequest(() =>
    api.put<unknown>(`/admin/tickets/${id}/close`, payload)
  )
}

export async function getAdminAuditLogs(
  filters: AuditLogFilters = {}
): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>('/admin/audit-logs', { params: filters })
  )
}

export async function getAdminSettings(): Promise<unknown> {
  return adminRequest(() => api.get<unknown>('/admin/settings'))
}

export async function updateAdminSettings(payload: unknown): Promise<unknown> {
  return adminRequest(() => api.put<unknown>('/admin/settings', payload))
}

export async function broadcastAdminNotification(
  payload: unknown
): Promise<unknown> {
  return adminRequest(() =>
    api.post<unknown>('/admin/notifications/broadcast', payload)
  )
}

export async function getFailedAdminLogins(): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>('/admin/security/failed-logins')
  )
}

export async function blockAdminIp(payload: unknown): Promise<unknown> {
  return adminRequest(() =>
    api.post<unknown>('/admin/security/block-ip', payload)
  )
}

export async function getAdminSessions(): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>('/admin/security/sessions')
  )
}

export async function getAdminAnalyticsOverview(): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>('/admin/analytics/overview')
  )
}

export async function getAdminAnalyticsRevenue(): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>('/admin/analytics/revenue')
  )
}

export async function getAdminAnalyticsTraffic(): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>('/admin/analytics/traffic')
  )
}

export async function getAdminAnalyticsConversion(): Promise<unknown> {
  return adminRequest(() =>
    api.get<unknown>('/admin/analytics/conversion')
  )
}
