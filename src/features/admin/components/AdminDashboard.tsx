import { Outlet } from '@tanstack/react-router'
import React from 'react'
import AdminHeader from './AdminHeader'

const AdminDashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand p-6">
            <div className="max-w-7xl mx-auto">
                <AdminHeader />
            </div>
            <Outlet />
        </div>
    )
}

export default AdminDashboard
