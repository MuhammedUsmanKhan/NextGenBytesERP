export interface InventoryDto {
  id: string
  productId: string
  productName: string
  productCode: string
  warehouseId: string
  warehouseName: string
  quantityOnHand: number
  reservedQuantity: number
  availableQuantity: number
  averageCost: number
  minStock: number | null
  maxStock: number | null
  reorderLevel: number | null
  updatedAt: string
}

export interface OpeningStockRequest {
  productId: string
  warehouseId: string
  quantity: number
  averageCost: number
  transactionDate: string
  remarks?: string | null
}

export interface InventoryTransactionDto {
  id: string
  productId: string
  productName: string
  productCode: string
  warehouseId: string
  warehouseName: string
  transactionType: string
  referenceType: string | null
  referenceId: string | null
  quantity: number
  unitCost: number
  transactionDate: string
  remarks: string | null
  createdBy: string
  createdAt: string
}

export interface InventoryFilters {
  page?: number
  pageSize?: number
  warehouseId?: string
  productId?: string
  belowReorder?: boolean
}

export interface TransactionFilters {
  page?: number
  pageSize?: number
  productId?: string
  warehouseId?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}
