import { useState } from "react"
import { Users as UsersIcon, Loader2, X, Plus, Shield } from "lucide-react"
import { useUsers, useUserRoles, useAssignRoles, useRemoveRole } from "@/hooks/useUsers"
import { useRoles } from "@/hooks/useRoles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { UserDto } from "@/types"

export default function Users() {
  const { data: users, isLoading, isError, refetch } = useUsers()
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <UsersIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Users & Roles</h1>
          <p className="text-sm text-zinc-500">Manage users and their role assignments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-red-500">Failed to load users</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !users || users.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Roles</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-zinc-100 transition-colors hover:bg-zinc-50 cursor-pointer ${
                        selectedUser?.id === user.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="py-3 pr-4 font-medium text-slate-900">{user.email}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length === 0 ? (
                            <span className="text-xs text-zinc-400">No roles</span>
                          ) : (
                            user.roles.map((role) => (
                              <Badge key={role} variant="secondary">
                                {role}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedUser(user)
                            setShowAssignModal(true)
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Assign Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && <UserRolesPanel userId={selectedUser.id} />}

      {showAssignModal && selectedUser && (
        <AssignRoleModal
          userId={selectedUser.id}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

function UserRolesPanel({ userId }: { userId: string }) {
  const { data: roles, isLoading, isError, refetch } = useUserRoles(userId)
  const removeRole = useRemoveRole()
  const [removing, setRemoving] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assigned Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assigned Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-sm text-red-500">Failed to load roles</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Assigned Roles</CardTitle>
      </CardHeader>
      <CardContent>
        {!roles || roles.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">No roles assigned to this user</p>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{role.name}</p>
                    {role.description && (
                      <p className="text-xs text-zinc-500">{role.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  disabled={removeRole.isPending}
                  onClick={async () => {
                    setRemoving(role.id)
                    await removeRole.mutateAsync({ userId, roleId: role.id })
                    setRemoving(null)
                  }}
                >
                  {removing === role.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AssignRoleModal({
  userId,
  onClose,
}: {
  userId: string
  onClose: () => void
}) {
  const { data: allRoles, isLoading: rolesLoading } = useRoles()
  const { data: userRoles } = useUserRoles(userId)
  const assignRoles = useAssignRoles()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const availableRoles =
    allRoles?.filter(
      (r) => !userRoles?.some((ur) => ur.id === r.id)
    ) || []

  async function handleAssign() {
    if (selectedIds.length === 0) return
    await assignRoles.mutateAsync({ userId, data: { roleIds: selectedIds } })
    onClose()
  }

  function toggleRole(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Assign Roles</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {rolesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : availableRoles.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">
            No more roles available to assign
          </p>
        ) : (
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {availableRoles.map((role) => (
              <label
                key={role.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-zinc-50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{role.name}</p>
                  {role.description && (
                    <p className="text-xs text-zinc-500">{role.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedIds.length === 0 || assignRoles.isPending}
          >
            {assignRoles.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {assignRoles.isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </div>
    </div>
  )
}
