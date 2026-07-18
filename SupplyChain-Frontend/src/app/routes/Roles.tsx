import { useState } from "react"
import { Shield, Loader2, Plus, X, Check } from "lucide-react"
import { useRoles, useCreateRole, useAssignPermissions, useRemovePermission } from "@/hooks/useRoles"
import { usePermissions } from "@/hooks/usePermissions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { RoleDto } from "@/types"

export default function Roles() {
  const { data: roles, isLoading, isError, refetch } = useRoles()
  const [showCreate, setShowCreate] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null)
  const [showPermissions, setShowPermissions] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Roles</h1>
            <p className="text-sm text-zinc-500">Manage roles and their permissions</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-red-500">Failed to load roles</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !roles || roles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-zinc-500">No roles found</p>
              <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
                Create your first role
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{role.name}</h3>
                      {role.description && (
                        <p className="text-xs text-zinc-500">{role.description}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role)
                        setShowPermissions(true)
                      }}
                    >
                      Manage Permissions
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.length === 0 ? (
                      <span className="text-xs text-zinc-400">No permissions assigned</span>
                    ) : (
                      role.permissions.map((perm) => (
                        <Badge key={perm} variant="default" className="gap-1">
                          {perm}
                          <RemovePermissionButton roleId={role.id} permissionName={perm} />
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showCreate && (
        <CreateRoleDialog onClose={() => setShowCreate(false)} />
      )}

      {showPermissions && selectedRole && (
        <AssignPermissionsDialog
          role={selectedRole}
          onClose={() => {
            setShowPermissions(false)
            setSelectedRole(null)
          }}
        />
      )}
    </div>
  )
}

function RemovePermissionButton({ roleId, permissionName }: { roleId: string; permissionName: string }) {
  const { data: permissions } = usePermissions()
  const removePermission = useRemovePermission()
  const permissionId = permissions?.find((p) => p.name === permissionName)?.id

  if (!permissionId) return null

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        removePermission.mutate({ roleId, permissionId })
      }}
      disabled={removePermission.isPending}
      className="ml-0.5 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-red-100 hover:text-red-600"
    >
      <X className="h-2.5 w-2.5" />
    </button>
  )
}

function CreateRoleDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const createRole = useCreateRole()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createRole.mutateAsync({ name: name.trim(), description: description.trim() || null })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Create Role</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="role-name">
              Role Name
            </label>
            <input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Manager"
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="role-desc">
              Description
            </label>
            <input
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createRole.isPending}>
              {createRole.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createRole.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AssignPermissionsDialog({
  role,
  onClose,
}: {
  role: RoleDto
  onClose: () => void
}) {
  const { data: allPermissions, isLoading: permsLoading } = usePermissions()
  const assignPermissions = useAssignPermissions()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const existingPermNames = new Set(role.permissions)
  const availablePerms = allPermissions || []

  function togglePermission(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleSave() {
    await assignPermissions.mutateAsync({
      roleId: role.id,
      data: { permissionIds: Array.from(selectedIds) },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Manage Permissions</h2>
            <p className="text-sm text-zinc-500">Role: {role.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {permsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : availablePerms.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">No permissions available</p>
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {availablePerms.map((perm) => {
              const alreadyAssigned = existingPermNames.has(perm.name)
              const isSelected = selectedIds.has(perm.id)
              return (
                <label
                  key={perm.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-zinc-50 ${
                    alreadyAssigned ? "opacity-60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={alreadyAssigned || isSelected}
                    disabled={alreadyAssigned}
                    onChange={() => togglePermission(perm.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{perm.name}</p>
                    {perm.description && (
                      <p className="text-xs text-zinc-500">{perm.description}</p>
                    )}
                  </div>
                  {alreadyAssigned && (
                    <Check className="h-4 w-4 text-emerald-500" />
                  )}
                </label>
              )
            })}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
          <p className="text-xs text-zinc-500">
            {Array.from(selectedIds).length} permission(s) selected
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={assignPermissions.isPending}>
              {assignPermissions.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {assignPermissions.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
