'use client'

import type { ReactNode } from 'react'
import { useAuth } from '../hooks/auth.hook'
import { hasRole } from '../utils/role.util'

interface ProtectedRouteProps {
    children: ReactNode
    requiredRoles?: string[]
    fallback?: ReactNode
}

const ProtectedRoute = ({
    children,
    requiredRoles = [],
    fallback = <div>Access Denied</div>
}: ProtectedRouteProps) => {
    const { account, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>
    }

    if (!isAuthenticated) {
        return <div>Please login to access this page</div>
    }

    // Check roles // Not check
    if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some((role) => hasRole(account, role))
        if (!hasRequiredRole) {
            return <>{fallback}</>
        }
    }

    return <>{children}</>
}

export default ProtectedRoute
