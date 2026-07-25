export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
  traceId: string
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ApiError {
  success: boolean
  errors?: { field: string; message: string }[]
  message: string
  traceId: string
}
