import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import { ADMIN_ROOMS, BASE_ADMIN } from '../routes'
import AdminSidebar from './AdminSidebar'

const AdminDashboard: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        // If user is at /admin exactly, redirect to first menu item (rooms)
        if (location.pathname === `/${BASE_ADMIN}` || location.pathname === `/${BASE_ADMIN}/`) {
            navigate({ to: `/${BASE_ADMIN}/${ADMIN_ROOMS}` })
        }
    }, [location.pathname, navigate])

    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar />
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
