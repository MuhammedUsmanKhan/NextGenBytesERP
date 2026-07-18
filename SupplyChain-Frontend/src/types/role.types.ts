export interface RoleDto {
  id: string
  name: string
  description: string | null
  permissions: string[]
}

export interface CreateRoleRequest {
  name: string
  description?: string | null
}

export interface AssignPermissionsRequest {
  permissionIds: string[]
}
