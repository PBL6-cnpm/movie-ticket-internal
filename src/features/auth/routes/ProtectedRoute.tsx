'use client'

import type { ReactNode } from 'react'
import { useAuth } from '../hooks/auth.hook'
import { hasPermission, hasRole } from '../utils/auth.utils'

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
    const { user, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>
    }

    if (!isAuthenticated) {
        return <div>Please login to access this page</div>
    }

    // Check roles
    if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some((role) => hasRole(user, role))
        if (!hasRequiredRole) {
            return <>{fallback}</>
        }
    }

    // Check permissions - fixed to use correct function signature
    if (requiredPermissions.length > 0) {
        const hasRequiredPermission = requiredPermissions.every(
            (permissionName) => hasPermission(user, permissionName) // Now uses 2 parameters as expected
        )
        if (!hasRequiredPermission) {
            return <>{fallback}</>
        }
    }

    return <>{children}</>
}

export default ProtectedRoute
