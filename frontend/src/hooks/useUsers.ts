import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as usersApi from "@/api/users.api"
import type { AssignRolesRequest } from "@/types"

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getUsers,
  })
}

export function useUserRoles(userId: string | null) {
  return useQuery({
    queryKey: ["users", userId, "roles"],
    queryFn: () => usersApi.getUserRoles(userId!),
    enabled: !!userId,
  })
}

export function useAssignRoles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string
      data: AssignRolesRequest
    }) => usersApi.assignRoles(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId, "roles"] })
      toast.success("Role assigned successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to assign role"
      toast.error(message)
    },
  })
}

export function useRemoveRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      roleId,
    }: {
      userId: string
      roleId: string
    }) => usersApi.removeRole(userId, roleId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId, "roles"] })
      toast.success("Role removed successfully")
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to remove role"
      toast.error(message)
    },
  })
}
