import api from './client'

export interface SummaryData {
  users: { total: number; newLast7Days: number; trend: number }
  sellers: { total: number }
  products: { total: number; newLast7Days: number }
  orders: { total: number; newLast7Days: number; trend: number }
  revenue: { total: number }
}

export interface DashboardChartPoint {
  date: string
  dayLabel: string
  orders: number
  revenue: number
}

export interface DashboardProduct {
  id: number
  name: string
  main_image: string | null
  price: number | string
  sales_count: number
  stock: number
  rating: number | null
}

export interface DashboardOrder {
  id: number
  order_number: string
  total_amount: number | string
  status: string
  created_at: string
  buyer_name: string | null
  buyer_email: string | null
}

export interface DashboardUser {
  id: number
  full_name: string
  email: string
  role: string
  avatar_url: string | null
  created_at: string
}

export interface DashboardAlert {
  type: 'info' | 'warning' | 'danger'
  message: string
  count: number
}

export async function getSummary(): Promise<SummaryData> {
  const res = await api.get<{ data: SummaryData }>('/admin/dashboard/summary')
  return res.data.data
}

export async function getChart(): Promise<DashboardChartPoint[]> {
  const res = await api.get<{ data: DashboardChartPoint[] }>(
    '/admin/dashboard/chart'
  )
  return res.data.data
}

export async function getTopProducts(): Promise<DashboardProduct[]> {
  const res = await api.get<{ data: DashboardProduct[] }>(
    '/admin/dashboard/top-products'
  )
  return res.data.data
}

export async function getRecentOrders(): Promise<DashboardOrder[]> {
  const res = await api.get<{ data: DashboardOrder[] }>(
    '/admin/dashboard/recent-orders'
  )
  return res.data.data
}

export async function getRecentUsers(): Promise<DashboardUser[]> {
  const res = await api.get<{ data: DashboardUser[] }>(
    '/admin/dashboard/recent-users'
  )
  return res.data.data
}

export async function getAlerts(): Promise<DashboardAlert[]> {
  const res = await api.get<{ data: DashboardAlert[] }>(
    '/admin/dashboard/alerts'
  )
  return res.data.data
}
