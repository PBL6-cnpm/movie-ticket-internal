'use client'

import type { ReactNode } from 'react'
import { useAuth } from '../hooks/auth.hook'
import {
    hasPermission,
    hasRole,
    mapAccountResponseToUser,
    mapAccountResponseToUserWithDetails
} from '../utils/auth.utils'

interface ProtectedRouteProps {
    children: ReactNode
    requiredRoles?: string[]
    requiredPermissions?: string[] // Changed to simple string array to match hasPermission function
    fallback?: ReactNode
}

const ProtectedRoute = ({
    children,
    requiredRoles = [],
    requiredPermissions = [],
    fallback = <div>Access Denied</div>
}: ProtectedRouteProps) => {
    const { user: accountUser, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>
    }

    if (!isAuthenticated) {
        return <div>Please login to access this page</div>
    }

    // Convert AccountResponse to User for role checking
    const user = mapAccountResponseToUser(accountUser)

    // Check roles
    if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some((role) => hasRole(user, role))
        if (!hasRequiredRole) {
            return <>{fallback}</>
        }
    }

    // Check permissions - convert to UserWithDetails for permission checking
    if (requiredPermissions.length > 0) {
        if (!accountUser) {
            return <>{fallback}</>
        }
        const userWithDetails = mapAccountResponseToUserWithDetails(accountUser)
        if (!userWithDetails) {
            return <>{fallback}</>
        }
        const hasRequiredPermission = requiredPermissions.every((permissionName) =>
            hasPermission(userWithDetails, permissionName)
        )
        if (!hasRequiredPermission) {
            return <>{fallback}</>
        }
    }

    return <>{children}</>
}

export default ProtectedRoute
