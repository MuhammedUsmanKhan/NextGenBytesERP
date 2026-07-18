export interface UserDto {
  id: string
  email: string
  roles: string[]
}

export interface AssignRolesRequest {
  roleIds: string[]
}
