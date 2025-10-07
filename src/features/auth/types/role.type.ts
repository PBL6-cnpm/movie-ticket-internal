export interface Role {
    roleId: string
    roleName: string
    permissions?: Permission[] // Optional populated permissions
}

export interface Permission {
    permissionId: number
    permissionName: string
}

export interface PermissionInRole {
    id: string
    name: string
    isHas: boolean
}

// Responses
export interface RoleResponse {
    roleId: string
    roleName: string
}
