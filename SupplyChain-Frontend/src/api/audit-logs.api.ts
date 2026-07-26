import api from "./axios"
import type { ApiResponse, PagedResponse } from "@/types"
import type { AuditLogDto, AuditLogFilters } from "@/types/audit-log.types"

export async function getAuditLogs(params?: AuditLogFilters) {
  const response = await api.get<ApiResponse<PagedResponse<AuditLogDto>>>("/api/v1/audit-logs", { params })
  return response.data.data
}
