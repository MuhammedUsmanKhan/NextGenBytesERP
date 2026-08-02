import { useQuery } from "@tanstack/react-query"
import * as auditLogsApi from "@/api/audit-logs.api"
import type { AuditLogFilters } from "@/types/audit-log.types"

export function useGetAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => auditLogsApi.getAuditLogs(filters),
  })
}
