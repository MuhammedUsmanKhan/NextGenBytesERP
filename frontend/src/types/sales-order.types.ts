export type SalesOrderStatus = "Open" | "Closed"

export interface SalesOrderItemDto {
  id: string
  productId: string
  productName: string
  description: string | null
  quantity: number
  unitPrice: number
  lineAmount: number
}

export interface SalesOrderDto {
  id: string
  salesOrderNumber: string
  orderDate: string
  customerId: string
  customerName: string
  customerPurchaseOrderNumber: string | null
  expectedDeliveryDate: string | null
  warehouseId: string | null
  warehouseName: string | null
  departmentId: string | null
  departmentName: string | null
  cycleShot: string | null
  status: SalesOrderStatus
  remarks: string | null
  subTotal: number
  discountAmount: number
  taxAmount: number
  grandTotal: number
  items: SalesOrderItemDto[]
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}

export interface SalesOrderListDto {
  id: string
  salesOrderNumber: string
  orderDate: string
  customerId: string
  customerName: string
  customerPurchaseOrderNumber: string | null
  expectedDeliveryDate: string | null
  warehouseId: string | null
  warehouseName: string | null
  departmentId: string | null
  departmentName: string | null
  cycleShot: string | null
  status: SalesOrderStatus
  remarks: string | null
  subTotal: number
  discountAmount: number
  taxAmount: number
  grandTotal: number
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}

export interface CreateSalesOrderItemRequest {
  productId: string
  description?: string | null
  quantity: number
  unitPrice: number
}

export interface CreateSalesOrderRequest {
  orderDate: string
  customerId: string
  customerPurchaseOrderNumber?: string | null
  expectedDeliveryDate?: string | null
  warehouseId?: string | null
  departmentId?: string | null
  cycleShot?: string | null
  remarks?: string | null
  discountAmount?: number
  taxAmount?: number
  items: CreateSalesOrderItemRequest[]
}

export type UpdateSalesOrderRequest = CreateSalesOrderRequest

export interface SalesOrderQueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}
