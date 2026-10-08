import api from './client'

export interface User {
  id: number
  full_name: string
  email: string
  phone?: string
  role: string
  is_verified: number
  is_active: number
  avatar_url?: string
  city?: string
  created_at: string
}

export interface UsersResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function getUsers(params: {
  page?: number
  limit?: number
  role?: string
  search?: string
  status?: string
}): Promise<UsersResponse> {
  const res = await api.get('/admin/users', { params })
  return res.data
}

export async function getUserById(id: number): Promise<User> {
  const res = await api.get<{ data: User }>(`/admin/users/${id}`)
  return res.data.data
}

export async function updateUserRole(id: number, role: string) {
  const res = await api.put(`/admin/users/${id}/role`, { role })
  return res.data
}

export async function toggleUserStatus(id: number) {
  const res = await api.put(`/admin/users/${id}/status`)
  return res.data
}

export async function deleteUser(id: number) {
  const res = await api.delete(`/admin/users/${id}`)
  return res.data
}