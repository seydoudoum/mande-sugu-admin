import api from './client'

export interface Order {
  id: number
  order_number: string
  buyer_name: string
  buyer_email: string
  total_amount: string
  status: string
  created_at: string
}

export interface OrdersResponse {
  data: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function getOrders(params: {
  page?: number
  limit?: number
  status?: string
}): Promise<OrdersResponse> {
  const res = await api.get('/admin/orders', { params })
  return res.data
}

export async function updateOrderStatus(id: number, status: string) {
  const res = await api.put(`/admin/orders/${id}/status`, { status })
  return res.data
}