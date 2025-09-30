export interface RoleResponse {
    id: string
    name: string
}

export interface Role {
    id: string
    name: string
}

export interface Permission {
    id: string
    name: string
}

export interface PermissionInRole {
    id: string
    name: string
    isHas: boolean
}
