import { useState } from "react"
import { X, Search, Shield } from "lucide-react"
import { useUsers, useAssignRoles, useRemoveRole } from "@/hooks/useUsers"
import { useRoles } from "@/hooks/useRoles"
import { useNotificationStore } from "@/stores/notification.store"
import type { UserDto } from "@/types"

export default function Users() {
  const { data: users, isLoading, isError, refetch } = useUsers()
  const { data: allRoles } = useRoles()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeAssignUser, setActiveAssignUser] = useState<UserDto | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const assignRoles = useAssignRoles()

  const handleOpenAssignModal = (user: UserDto) => {
    setActiveAssignUser(user)
    setSelectedRoleIds(user.roles)
  }

  const handleCheckboxToggle = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    )
  }

  const handleSaveRoles = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeAssignUser) return

    await assignRoles.mutateAsync({
      userId: activeAssignUser.id,
      data: { roleIds: selectedRoleIds },
    })

    addNotification({
      text: `Roles for "${activeAssignUser.email}" updated.`,
      read: false,
      type: "success",
    })

    setActiveAssignUser(null)
  }

  const filteredUsers =
    users?.filter((u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  return (
    <div className="space-y-6 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span>
        <span>/</span>
        <span className="text-slate-800">Users & Roles</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Users & Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Manage users and their role assignments</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* All Users Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden lg:col-span-7">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">All Users</h2>
            <div className="relative w-48">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4.5">Email</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12">
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-red-500 font-semibold">Failed to load users</p>
                        <button
                          onClick={() => refetch()}
                          className="px-3 py-1.5 text-[11px] font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-slate-400">
                      No user records found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4.5 text-slate-900 font-semibold">{user.email}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleOpenAssignModal(user)}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 font-bold rounded-lg transition-all text-[11px] active:scale-95 cursor-pointer"
                          >
                            Assign Role
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Roles Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Assigned Roles</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Active system roles currently operational in the ERP.
            </p>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((usr) =>
              usr.roles.map((roleId) => {
                const matchedRole = allRoles?.find((r) => r.id === roleId)
                const roleName = matchedRole?.name || roleId
                const desc = matchedRole?.description || "Custom operational scope"
                return (
                  <div
                    key={`${usr.id}-${roleId}`}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all flex items-start gap-3.5 relative group"
                  >
                    <div className="w-9 h-9 bg-white border border-slate-200/60 rounded-lg flex items-center justify-center text-slate-500 shadow-sm">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <h4 className="text-xs font-bold text-slate-800">{roleName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{desc}</p>
                      <p className="text-[9px] font-mono font-semibold text-blue-600 mt-1.5 truncate">
                        {usr.email}
                      </p>
                    </div>
                    <RemoveRoleButton userId={usr.id} roleId={roleId} />
                  </div>
                )
              })
            )}
            {filteredUsers.length > 0 &&
              filteredUsers.every((u) => u.roles.length === 0) && (
                <p className="text-xs text-slate-400 text-center py-4">No roles assigned to any user.</p>
              )}
          </div>
        </div>
      </div>

      {/* Assign Roles Modal */}
      {activeAssignUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Assign Roles</h3>
              <button
                onClick={() => setActiveAssignUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoles} className="p-6 space-y-6">
              <div className="text-xs text-slate-500 mb-2">
                Configure roles for user:{" "}
                <span className="font-mono font-bold text-slate-800 text-xs block mt-1">
                  {activeAssignUser.email}
                </span>
              </div>

              <div className="space-y-4">
                {allRoles?.map((role) => {
                  const isChecked = selectedRoleIds.includes(role.id)
                  return (
                    <label
                      key={role.id}
                      className={`flex items-start gap-3.5 p-3.5 border rounded-xl cursor-pointer transition-all ${
                        isChecked
                          ? "bg-blue-50/25 border-blue-200"
                          : "bg-white border-slate-100 hover:bg-slate-50/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle(role.id)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-800">{role.name}</span>
                        <span className="block text-[10px] text-slate-400 mt-1 leading-normal">
                          {role.description}
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-50 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveAssignUser(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignRoles.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  {assignRoles.isPending ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function RemoveRoleButton({ userId, roleId }: { userId: string; roleId: string }) {
  const removeRole = useRemoveRole()

  return (
    <button
      onClick={() => removeRole.mutate({ userId, roleId })}
      disabled={removeRole.isPending}
      className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-100 hover:border-red-100 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer disabled:opacity-50"
    >
      <X className="w-3 h-3" />
      Remove
    </button>
  )
}
