export interface User {
    account_id: string
    branch_id?: string
    email: string
    password?: string // Optional vì không nên return password
    coin: number
    status: boolean
    role_id: number

    role?: Role // Optional populated role
    name?: string // Additional field for display
    avatar?: string // Additional field for UI
    createdAt?: string // Additional field
    updatedAt?: string // Additional field
}

export interface Role {
    role_id: number
    roleName: string
    permissions?: Permission[] // Optional populated permissions
}

export interface Permission {
    permission_id: number
    permissionName: string
}

export interface RolePermission {
    role_id: number
    permission_id: number
}

export interface Branch {
    branch_id: string
    branchName?: string
    // Add other branch fields as needed
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    email: string
    password: string
    confirmPassword: string
    branch_id?: string
    name?: string // For display purposes
}

export interface AuthState {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    error: string | null
}

export interface AuthResponse {
    user: User
    accessToken: string
    refreshToken: string
}

export interface UserWithDetails extends User {
    role: Role
    branch?: Branch
    permissions: Permission[]
}

export type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User } }
    | { type: 'AUTH_ERROR'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' }
