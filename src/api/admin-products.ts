import api from './client'

export interface Product {
  id: number
  name: string
  price: string
  stock: number
  main_image: string
  seller_id: number
  seller_name?: string
  is_active: number
  sales_count: number
  rating: string
  created_at: string
}

export interface ProductsResponse {
  data: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function getProducts(params: {
  page?: number
  limit?: number
  search?: string
}): Promise<ProductsResponse> {
  const res = await api.get('/admin/products', { params })
  return res.data
}

export async function updateProductStatus(id: number, is_active: boolean) {
  const res = await api.put(`/admin/products/${id}/status`, { is_active })
  return res.data
}

export async function deleteProduct(id: number) {
  const res = await api.delete(`/admin/products/${id}`)
  return res.data
}