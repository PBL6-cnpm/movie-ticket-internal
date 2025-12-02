'use client'

import { Outlet, useLocation } from '@tanstack/react-router'
import EmployeeHeader from '../../components/EmployeeHeader'
import EmployeeSidebar from '../../components/EmployeeSidebar'

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

import { Calendar, DollarSign, Ticket, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { usePopularMovies, useRevenue } from '../hooks/useReportsApi'

const DashboardContent = () => {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
    const { data: revenueData, isLoading: isLoadingRevenue } = useRevenue(period)
    const { data: popularMovies, isLoading: isLoadingMovies } = usePopularMovies()

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#e86d28] to-[#d35f1a] rounded-xl p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
                        <p className="text-xl text-orange-100">
                            Staff Dashboard - Ready to assist customers
                        </p>
                    </div>

                    {/* Period Selector */}
                    <div className="flex gap-2 bg-white/10 p-1 rounded-lg backdrop-blur-sm">
                        {(['day', 'week', 'month'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    period === p
                                        ? 'bg-white text-[#e86d28] shadow-sm'
                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1a2232] p-6 rounded-xl border border-white/5 shadow-lg hover:border-[#e86d28]/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-400">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {isLoadingRevenue
                                    ? '...'
                                    : `${revenueData?.totalRevenue.toLocaleString() || 0} VND`}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <DollarSign className="text-green-500" size={24} />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        Based on {period}ly performance
                    </div>
                </div>

                <div className="bg-[#1a2232] p-6 rounded-xl border border-white/5 shadow-lg hover:border-[#e86d28]/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-400">Tickets Sold</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {isLoadingRevenue ? '...' : revenueData?.totalBookings || 0}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Ticket className="text-blue-500" size={24} />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        Total bookings for this {period}
                    </div>
                </div>

                <div className="bg-[#1a2232] p-6 rounded-xl border border-white/5 shadow-lg hover:border-[#e86d28]/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-400">Current Period</p>
                            <h3 className="text-2xl font-bold text-white mt-1 capitalize">
                                {period}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <Calendar className="text-purple-500" size={24} />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Viewing data for: {period}</div>
                </div>
            </div>

            {/* Top Movies */}
            <div className="bg-[#1a2232] rounded-xl border border-white/5 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="text-[#fe7e32]" size={20} />
                    <h2 className="text-lg font-bold text-white">Top Performing Movies</h2>
                </div>

                <div className="space-y-4">
                    {isLoadingMovies ? (
                        <div className="text-center py-8 text-gray-400">Loading movies...</div>
                    ) : popularMovies && popularMovies.length > 0 ? (
                        popularMovies.map((movie, index) => (
                            <div
                                key={movie.movieId}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                                            index === 0
                                                ? 'bg-yellow-500/20 text-yellow-500'
                                                : index === 1
                                                  ? 'bg-gray-400/20 text-gray-400'
                                                  : index === 2
                                                    ? 'bg-orange-700/20 text-orange-700'
                                                    : 'bg-white/10 text-white'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <span className="text-white font-medium">
                                        {movie.movieName}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    <span className="text-white font-bold">
                                        {movie.bookingCount}
                                    </span>{' '}
                                    bookings
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">No data available.</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EmployeeDashboard
