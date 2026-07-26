import api from "./axios"
import type { ApiResponse, PagedResponse } from "@/types"
import type { InventoryDto, InventoryTransactionDto, OpeningStockRequest, InventoryFilters, TransactionFilters } from "@/types/inventory.types"

export async function getInventoryList(params?: InventoryFilters) {
  const response = await api.get<ApiResponse<PagedResponse<InventoryDto>>>("/api/v1/inventory", { params })
  return response.data.data
}

export async function getInventoryById(productId: string, warehouseId: string) {
  const response = await api.get<ApiResponse<InventoryDto>>(`/api/v1/inventory/${productId}/${warehouseId}`)
  return response.data.data
}

export async function createOpeningStock(data: OpeningStockRequest) {
  const response = await api.post<ApiResponse<InventoryTransactionDto>>("/api/v1/inventory/opening-stock", data)
  return response.data.data
}

export async function getTransactions(params?: TransactionFilters) {
  const response = await api.get<ApiResponse<PagedResponse<InventoryTransactionDto>>>("/api/v1/inventory/transactions", { params })
  return response.data.data
}

export async function getTransactionById(id: string) {
  const response = await api.get<ApiResponse<InventoryTransactionDto>>(`/api/v1/inventory/transactions/${id}`)
  return response.data.data
}
