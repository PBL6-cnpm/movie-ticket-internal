import type { Permission, User, UserWithDetails } from '../types/auth.type'

export const hasPermission = (user: UserWithDetails | null, permissionName: string): boolean => {
    if (!user || !user.permissions) return false
    return user.permissions.some((permission) => permission.permissionName === permissionName)
}

export const hasRole = (user: User | null, roleName: string): boolean => {
    if (!user || !user.role) return false
    return user.role.roleName === roleName
}

export const hasRoleId = (user: User | null, roleId: number): boolean => {
    if (!user) return false
    return user.role_id === roleId
}

export const hasAnyRole = (user: User | null, roleNames: string[]): boolean => {
    if (!user || !user.role) return false
    return roleNames.includes(user.role.roleName)
}

export const getTokenFromStorage = (): string | null => {
    return localStorage.getItem('accessToken')
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Date.now() / 1000
        return payload.exp < currentTime
    } catch {
        return true
    }
}

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
    return password.length >= 6
}

// Role IDs constants - Không dùng 'as const' để tránh lỗi indexing
export const ROLE_IDS = {
    ADMIN: 1,
    EMPLOYEE: 2,
    USER: 3
}

// Define type cho MOCK_PERMISSIONS
type PermissionsMap = {
    [key: number]: Permission[]
}

// Mock permissions mapping với proper typing
export const MOCK_PERMISSIONS: PermissionsMap = {
    [ROLE_IDS.ADMIN]: [
        { permission_id: 1, permissionName: 'users.create' },
        { permission_id: 2, permissionName: 'users.read' },
        { permission_id: 3, permissionName: 'users.update' },
        { permission_id: 4, permissionName: 'users.delete' },
        { permission_id: 5, permissionName: 'movies.create' },
        { permission_id: 6, permissionName: 'movies.read' },
        { permission_id: 7, permissionName: 'movies.update' },
        { permission_id: 8, permissionName: 'movies.delete' },
        { permission_id: 9, permissionName: 'bookings.create' },
        { permission_id: 10, permissionName: 'bookings.read' },
        { permission_id: 11, permissionName: 'bookings.update' },
        { permission_id: 12, permissionName: 'bookings.delete' },
        { permission_id: 13, permissionName: 'reports.read' },
        { permission_id: 14, permissionName: 'settings.update' }
    ],
    [ROLE_IDS.EMPLOYEE]: [
        { permission_id: 2, permissionName: 'users.read' },
        { permission_id: 6, permissionName: 'movies.read' },
        { permission_id: 7, permissionName: 'movies.update' },
        { permission_id: 9, permissionName: 'bookings.create' },
        { permission_id: 10, permissionName: 'bookings.read' },
        { permission_id: 11, permissionName: 'bookings.update' },
        { permission_id: 13, permissionName: 'reports.read' }
    ],
    [ROLE_IDS.USER]: [
        { permission_id: 6, permissionName: 'movies.read' },
        { permission_id: 9, permissionName: 'bookings.create' },
        { permission_id: 10, permissionName: 'bookings.read' },
        { permission_id: 15, permissionName: 'profile.update' }
    ]
}

// Helper function để get permissions by role_id
export const getPermissionsByRoleId = (roleId: number): Permission[] => {
    return MOCK_PERMISSIONS[roleId] || []
}

// Function để redirect user dựa trên role sau khi login
export const getRedirectPathByRole = (roleId: number): string => {
    switch (roleId) {
        case ROLE_IDS.ADMIN:
            return '/admin'
        case ROLE_IDS.EMPLOYEE:
            return '/employee'
        case ROLE_IDS.USER:
            return '/'
        default:
            return '/'
    }
}
