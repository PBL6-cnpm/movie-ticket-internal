import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import { BASE_SUPER_ADMIN, SUPER_ADMIN_ROLE } from '../routes'
import SuperAdminSidebar from './SuperAdminSidebar'

const AdminDashboard: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        // If user is at /super-admin exactly, redirect to first menu item (role management)
        if (
            location.pathname === `/${BASE_SUPER_ADMIN}` ||
            location.pathname === `/${BASE_SUPER_ADMIN}/`
        ) {
            navigate({ to: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_ROLE}` })
        }
    }, [location.pathname, navigate])

    return (
        <div className="min-h-screen bg-background">
            <SuperAdminSidebar />
            {/* Main content area with left padding for sidebar */}
            <div className="ml-64">
                <div className="p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
