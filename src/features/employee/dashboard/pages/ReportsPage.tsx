import React, { useState } from 'react'
import { useRevenue, usePopularMovies } from '../hooks/useReportsApi'
import { DollarSign, Ticket, TrendingUp, Calendar } from 'lucide-react'

const ReportsPage: React.FC = () => {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
    const { data: revenueData, isLoading: isLoadingRevenue } = useRevenue(period)
    const { data: popularMovies, isLoading: isLoadingMovies } = usePopularMovies()

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>

            {/* Period Selector */}
            <div className="flex gap-2">
                {(['day', 'week', 'month'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            period === p
                                ? 'bg-[#fe7e32] text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1a2232] p-6 rounded-xl border border-white/5">
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
                </div>

                <div className="bg-[#1a2232] p-6 rounded-xl border border-white/5">
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
                </div>

                <div className="bg-[#1a2232] p-6 rounded-xl border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-400">Period</p>
                            <h3 className="text-2xl font-bold text-white mt-1 capitalize">
                                {period}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <Calendar className="text-purple-500" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Movies */}
            <div className="bg-[#1a2232] rounded-xl border border-white/5 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="text-[#fe7e32]" size={20} />
                    <h2 className="text-lg font-bold text-white">Top Performing Movies</h2>
                </div>

                <div className="space-y-4">
                    {isLoadingMovies ? (
                        <p className="text-gray-400">Loading movies...</p>
                    ) : popularMovies && popularMovies.length > 0 ? (
                        popularMovies.map((movie, index) => (
                            <div
                                key={movie.movieId}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white font-bold">
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
                        <p className="text-gray-400">No data available.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ReportsPage
