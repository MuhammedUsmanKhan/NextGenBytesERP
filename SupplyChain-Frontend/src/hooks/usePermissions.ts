import { useQuery } from "@tanstack/react-query"
import { getPermissions } from "@/api/permissions.api"

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  })
}
