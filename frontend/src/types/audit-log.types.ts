export interface AuditLogDto {
  id: string
  userId: string
  entity: string
  entityId: string
  action: string
  oldValues: string | null
  newValues: string | null
  ipAddress: string | null
  createdAt: string
}

export interface AuditLogFilters {
  page?: number
  pageSize?: number
  entity?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
}
