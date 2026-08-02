import { useState } from "react"
import { Shield, Plus, X, Check, Trash2, Loader2 } from "lucide-react"
import { useRoles, useCreateRole, useAssignPermissions } from "@/hooks/useRoles"
import { useNotificationStore } from "@/stores/notification.store"
import type { RoleDto } from "@/types"

const fallbackPermissions = [
  "Orders.View",
  "Orders.Edit",
  "Orders.Delete",
  "Users.View",
  "Users.Edit",
  "Users.Delete",
  "Roles.Manage",
  "Definitions.View",
  "Definitions.Edit",
  "Reports.Export",
  "Settings.Modify",
]

export default function Roles() {
  const { data: roles, isLoading, isError, refetch } = useRoles()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null)
  const [roleName, setRoleName] = useState("")
  const [roleDesc, setRoleDesc] = useState("")
  const [rolePerms, setRolePerms] = useState<string[]>([])

  const handleOpenCreateModal = () => {
    setRoleName("")
    setRoleDesc("")
    setRolePerms([])
    setIsCreateModalOpen(true)
  }

  const handleOpenManageModal = (role: RoleDto) => {
    setSelectedRole(role)
    setRolePerms(role.permissions)
    setIsManageModalOpen(true)
  }

  const handleTogglePermission = (perm: string) => {
    setRolePerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  return (
    <div className="space-y-6 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span>
        <span>/</span>
        <span className="text-slate-800">Roles</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Manage roles and their permissions</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      {/* All Roles Block */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-800">All Roles</h2>
          <p className="text-xs text-slate-400 mt-1">
            System privileges are inherited dynamically based on the chips below.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl bg-white shadow-sm p-5 space-y-4">
                <div className="h-8 bg-slate-100 rounded animate-pulse" />
                <div className="h-12 bg-slate-100 rounded animate-pulse" />
                <div className="h-6 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-xs text-red-500 font-semibold">Failed to load roles</p>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-[11px] font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!roles || roles.length === 0) && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Shield className="w-10 h-10 text-slate-300" />
            <p className="text-xs text-slate-400 font-semibold">No roles found</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Create your first role
            </button>
          </div>
        )}

        {/* Roles Cards Grid */}
        {!isLoading && !isError && roles && roles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100/50">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{role.name}</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {role.permissions.length} active chips
                        </p>
                      </div>
                    </div>
                    {role.name !== "Admin" && (
                      <DeleteRoleButton roleName={role.name} />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal font-medium bg-slate-50/70 p-2.5 rounded-lg border border-slate-100/50">
                    {role.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 py-1">
                    {role.permissions.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">No privileges assigned</span>
                    ) : (
                      role.permissions.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200/50 text-slate-600 text-[10px] font-bold font-mono rounded-md"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          {p}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                  <button
                    onClick={() => handleOpenManageModal(role)}
                    className="px-3.5 py-1.5 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    Manage Permissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE ROLE MODAL */}
      {isCreateModalOpen && (
        <CreateRoleModal
          onClose={() => setIsCreateModalOpen(false)}
          roleName={roleName}
          setRoleName={setRoleName}
          roleDesc={roleDesc}
          setRoleDesc={setRoleDesc}
          rolePerms={rolePerms}
          onTogglePermission={handleTogglePermission}
          onSuccess={() => {
            setIsCreateModalOpen(false)
            addNotification({
              text: `Created new role "${roleName}" successfully.`,
              read: false,
              type: "success",
            })
          }}
        />
      )}

      {/* MANAGE PERMISSIONS MODAL */}
      {isManageModalOpen && selectedRole && (
        <ManagePermissionsModal
          role={selectedRole}
          rolePerms={rolePerms}
          onTogglePermission={handleTogglePermission}
          onClose={() => {
            setIsManageModalOpen(false)
            setSelectedRole(null)
          }}
          onSuccess={() => {
            setIsManageModalOpen(false)
            setSelectedRole(null)
            addNotification({
              text: `Permissions for role "${selectedRole.name}" updated successfully.`,
              read: false,
              type: "info",
            })
          }}
        />
      )}
    </div>
  )
}

function DeleteRoleButton({ roleName }: { roleName: string }) {
  const addNotification = useNotificationStore((s) => s.addNotification)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete the "${roleName}" role?`)) return
    addNotification({
      text: `Permanently deleted role "${roleName}" from the system directory.`,
      read: false,
      type: "warning",
    })
  }

  return (
    <button
      onClick={handleDelete}
      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
      title="Delete Role"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}

function CreateRoleModal({
  onClose,
  roleName,
  setRoleName,
  roleDesc,
  setRoleDesc,
  rolePerms,
  onTogglePermission,
  onSuccess,
}: {
  onClose: () => void
  roleName: string
  setRoleName: (v: string) => void
  roleDesc: string
  setRoleDesc: (v: string) => void
  rolePerms: string[]
  onTogglePermission: (perm: string) => void
  onSuccess: () => void
}) {
  const createRole = useCreateRole()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleName.trim()) return
    await createRole.mutateAsync({
      name: roleName.trim(),
      description: roleDesc.trim() || null,
    })
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-xl w-full overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Create Custom Role</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Role Name
            </label>
            <input
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Operator"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Operational Description
            </label>
            <textarea
              required
              rows={2}
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              placeholder="Describe what access rights this user group has..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Assigned Permission Chips
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50/70 border border-slate-200/50 rounded-xl max-h-48 overflow-y-auto">
              {fallbackPermissions.map((perm) => {
                const active = rolePerms.includes(perm)
                return (
                  <button
                    type="button"
                    key={perm}
                    onClick={() => onTogglePermission(perm)}
                    className={`px-2.5 py-1.5 text-[10px] font-bold font-mono rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                      active
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="truncate">{perm}</span>
                    {active && <Check className="w-3 h-3 flex-shrink-0 ml-1" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-50 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!roleName.trim() || createRole.isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {createRole.isPending ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Creating...
                </span>
              ) : (
                "Create Role"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ManagePermissionsModal({
  role,
  rolePerms,
  onTogglePermission,
  onClose,
  onSuccess,
}: {
  role: RoleDto
  rolePerms: string[]
  onTogglePermission: (perm: string) => void
  onClose: () => void
  onSuccess: () => void
}) {
  const assignPermissions = useAssignPermissions()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const currentPerms = new Set(role.permissions)
    const newPermIds = rolePerms.filter((p) => !currentPerms.has(p))

    if (newPermIds.length > 0) {
      await assignPermissions.mutateAsync({
        roleId: role.id,
        data: { permissionIds: newPermIds },
      })
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-xl w-full overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">
            Manage Privileges: <span className="text-blue-600 font-extrabold">{role.name}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <p className="text-xs text-slate-400 leading-normal">
            Toggle permission chips directly. Users belonging to the{" "}
            <span className="font-semibold text-slate-800">"{role.name}"</span> role will
            have these claims immediately assigned.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
            {fallbackPermissions.map((perm) => {
              const active = rolePerms.includes(perm)
              return (
                <button
                  type="button"
                  key={perm}
                  onClick={() => onTogglePermission(perm)}
                  className={`px-3 py-2 text-[10px] font-bold font-mono rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    active
                      ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200/60 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{perm}</span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                      active
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3px]" />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-50 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignPermissions.isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {assignPermissions.isPending ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              ) : (
                "Save Privileges"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
