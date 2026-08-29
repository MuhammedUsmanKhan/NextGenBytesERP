import api from "./axios"
import type { ApiResponse, PagedResponse } from "@/types"
import type {
  SalesOrderListDto,
  SalesOrderDto,
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
  SalesOrderQueryParams,
} from "@/types/sales-order.types"

const BASE = "/api/v1/sales-orders"

export async function getSalesOrders(params?: SalesOrderQueryParams) {
  const response = await api.get<ApiResponse<PagedResponse<SalesOrderListDto>>>(BASE, { params })
  return response.data.data
}

export async function getSalesOrderById(id: string) {
  const response = await api.get<ApiResponse<SalesOrderDto>>(`${BASE}/${id}`)
  return response.data.data
}

export async function createSalesOrder(data: CreateSalesOrderRequest) {
  const response = await api.post<ApiResponse<SalesOrderDto>>(BASE, data)
  return response.data.data
}

export async function updateSalesOrder(id: string, data: UpdateSalesOrderRequest) {
  const response = await api.put<ApiResponse<SalesOrderDto>>(`${BASE}/${id}`, data)
  return response.data.data
}

export async function closeSalesOrder(id: string) {
  const response = await api.patch<ApiResponse<SalesOrderDto>>(`${BASE}/${id}/close`)
  return response.data.data
}

export async function deleteSalesOrder(id: string) {
  await api.delete(`${BASE}/${id}`)
}
