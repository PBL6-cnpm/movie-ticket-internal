'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Outlet, useLocation } from '@tanstack/react-router'
import React from 'react'
import EmployeeSidebar from '../../components/EmployeeSidebar'
import EmployeeHeader from '../../components/EmployeeHeader'

const EmployeeDashboard = () => {
    const location = useLocation()

    // Show dashboard content when at exact /staff path
    const showDashboardContent = location.pathname === '/staff'

    return (
        <div className="min-h-screen bg-background">
            <EmployeeSidebar />
            {/* Main content area with left padding for sidebar */}
            <div className="ml-64">
                <EmployeeHeader />
                <div className="p-6">
                    {showDashboardContent ? <DashboardContent /> : <Outlet />}
                </div>
            </div>
        </div>
    )
}

const DashboardContent = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#e86d28] to-[#d35f1a] rounded-xl p-8 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
                        <p className="text-xl text-orange-100">
                            Staff Dashboard - Ready to assist customers
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Today's Sales" value="₫2,450,000" trend="+12%" trendUp={true} />
                <StatCard title="Tickets Sold" value="124" trend="+8%" trendUp={true} />
                <StatCard title="Active Bookings" value="18" trend="-3%" trendUp={false} />
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-[#e86d28] flex items-center gap-2">
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <ActivityItem
                            action="New booking created"
                            details="Customer: John Doe - Movie: Avengers"
                            time="5 minutes ago"
                        />
                        <ActivityItem
                            action="Refund processed"
                            details="Booking #12345 - Amount: ₫180,000"
                            time="15 minutes ago"
                        />
                        <ActivityItem
                            action="Customer inquiry resolved"
                            details="Seat change request completed"
                            time="30 minutes ago"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

interface StatCardProps {
    title: string
    value: string
    trend: string
    trendUp: boolean
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp }) => {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-white">{value}</p>
                        <p
                            className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}
                        >
                            {trendUp ? '↗️' : '↘️'} {trend}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

interface ActivityItemProps {
    action: string
    details: string
    time: string
}

const ActivityItem: React.FC<ActivityItemProps> = ({ action, details, time }) => {
    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
                <p className="font-medium text-gray-900">{action}</p>
                <p className="text-sm text-gray-600">{details}</p>
                <p className="text-xs text-gray-400 mt-1">{time}</p>
            </div>
        </div>
    )
}

export default EmployeeDashboard
