import { getRevenueByMovie, getRevenueByTime } from '@/shared/api/report-api'
import { Card, CardContent } from '@/shared/components/ui/card'
import { showToast } from '@/shared/utils/toast'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import {
    Bar,
    BarChart,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import type { MovieRevenue, RevenueByTime } from '../types/report.types'

// A vibrant and distinct color palette for charts
const COLORS = ['#e86d28', '#d35f1a', '#f6a564', '#f0c9a0', '#8fbcd4', '#a3d3a2']

// Formatter for currency, ensuring consistent display in VNĐ
const formatCurrency = (value: number) =>
    value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

// Formatter for Y-axis in VNĐ, making large numbers readable
const formatAxisVND = (tickItem: number) => {
    if (tickItem >= 1000000) {
        return `${tickItem / 1000000} Tr`
    }
    if (tickItem >= 1000) {
        return `${tickItem / 1000} k`
    }
    return tickItem.toString()
}

const MovieRevenueReport: React.FC = () => {
    // Default date range to the last 30 days for immediate, relevant data
    const today = useMemo(() => new Date(), [])
    const defaultEnd = useMemo(() => today.toISOString().split('T')[0], [today])
    const defaultStart = useMemo(() => {
        const d = new Date(today)
        d.setDate(d.getDate() - 30)
        return d.toISOString().split('T')[0]
    }, [today])

    const [startDate, setStartDate] = useState<string>(defaultStart)
    const [endDate, setEndDate] = useState<string>(defaultEnd)
    const [viewMode, setViewMode] = useState<'movie' | 'time'>('movie')
    const [groupBy, setGroupBy] = useState<'day' | 'month' | 'quarter' | 'year'>('month')

    const { data, isLoading, error } = useQuery({
        queryKey: ['reports', 'movies', startDate, endDate, viewMode],
        queryFn: async (): Promise<MovieRevenue[]> => {
            if (startDate && endDate && startDate > endDate) {
                showToast.error('Start date must be before or equal to end date')
                return []
            }
            return getRevenueByMovie({ startDate, endDate })
        },
        staleTime: 1000 * 60 * 5,
        enabled: viewMode === 'movie'
    })

    const {
        data: timeData,
        isLoading: isTimeLoading,
        error: timeError
    } = useQuery({
        queryKey: ['reports', 'time', groupBy, startDate, endDate],
        queryFn: async (): Promise<RevenueByTime[]> => {
            if (startDate && endDate && startDate > endDate) {
                showToast.error('Start date must be before or equal to end date')
                return []
            }
            return getRevenueByTime({ groupBy, startDate, endDate })
        },
        staleTime: 1000 * 60 * 5,
        enabled: viewMode === 'time'
    })

    // Memoize chart data processing to prevent re-renders
    const topMoviesData = useMemo(() => {
        const movies = data || []
        if (movies.length === 0) return []

        const sortedMovies = [...movies].sort((a, b) => b.totalRevenue - a.totalRevenue)
        const top5 = sortedMovies.slice(0, 5)

        const others = sortedMovies.slice(5)
        if (others.length > 0) {
            const othersRevenue = others.reduce((acc, cur) => acc + cur.totalRevenue, 0)
            const othersBookings = others.reduce((acc, cur) => acc + cur.totalBookings, 0)
            const othersSeats = others.reduce((acc, cur) => acc + cur.totalSeats, 0)

            return [
                ...top5,
                {
                    movieId: 'others',
                    movieName: 'Others',
                    totalRevenue: othersRevenue,
                    totalBookings: othersBookings,
                    totalSeats: othersSeats
                }
            ]
        }
        return top5
    }, [data])

    const barData = topMoviesData.map((m) => ({ name: m.movieName, Revenue: m.totalRevenue }))
    const pieData = topMoviesData.map((m) => ({ name: m.movieName, Bookings: m.totalBookings }))
    const movies = data || []

    return (
        <div className="min-h-screen space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    {viewMode === 'movie' ? 'Revenue by Movie' : 'Revenue by Time'}
                </h1>
                <p className="text-gray-400 mt-1">
                    {viewMode === 'movie'
                        ? 'Statistics of revenue and number of bookings per movie'
                        : 'Revenue statistics grouped by selected time period'}
                </p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <label className="text-sm text-gray-300 mr-2">View</label>
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as 'movie' | 'time')}
                        className="mr-4 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                    >
                        <option value="movie">By Movie</option>
                        <option value="time">By Time</option>
                    </select>

                    <label className="text-sm text-gray-300 mr-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mr-4 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                    />

                    <label className="text-sm text-gray-300 mr-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mr-4 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                    />

                    {viewMode === 'time' && (
                        <>
                            <label className="text-sm text-gray-300 mr-2">Group By</label>
                            <select
                                value={groupBy}
                                onChange={(e) =>
                                    setGroupBy(
                                        e.target.value as 'day' | 'month' | 'quarter' | 'year'
                                    )
                                }
                                className="mr-4 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            >
                                <option value="day">Day</option>
                                <option value="month">Month</option>
                                <option value="quarter">Quarter</option>
                                <option value="year">Year</option>
                            </select>
                        </>
                    )}

                    <button
                        onClick={() => {
                            if (startDate && endDate && startDate > endDate) {
                                showToast.error('Start date must be before or equal to end date')
                                return
                            }
                            showToast.success('Filters applied successfully')
                        }}
                        className="bg-[#e86d28] hover:bg-[#d35f1a] text-white px-3 py-1 rounded text-sm"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {viewMode === 'time' ? (
                isTimeLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#e86d28]" />
                        <span className="ml-2 text-gray-400">Loading report...</span>
                    </div>
                ) : timeError ? (
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent>
                            <div className="text-red-400">
                                Error loading time-based report. Please try again later.
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent>
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Revenue by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                                </h2>
                                <div style={{ width: '100%', height: 340 }}>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={(timeData || []).map((t) => ({
                                                name: t.period,
                                                Revenue: t.totalRevenue
                                            }))}
                                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                        >
                                            <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} />
                                            <YAxis
                                                stroke="#cbd5e1"
                                                fontSize={12}
                                                tickFormatter={formatAxisVND}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                            />
                                            <Bar dataKey="Revenue" fill="#e86d28" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* --- START: BẢNG CHI TIẾT ĐÃ ĐƯỢC BỔ SUNG --- */}
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent>
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Detailed List
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-700/50">
                                            <tr>
                                                <th className="text-left py-3 px-4 text-gray-300">
                                                    Period
                                                </th>
                                                <th className="text-right py-3 px-4 text-gray-300">
                                                    Revenue
                                                </th>
                                                <th className="text-right py-3 px-4 text-gray-300">
                                                    Bookings
                                                </th>
                                                <th className="text-right py-3 px-4 text-gray-300">
                                                    Total Seats
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(timeData || []).map((t) => (
                                                <tr
                                                    key={t.period}
                                                    className="border-b border-gray-700/50 hover:bg-gray-700/30"
                                                >
                                                    <td className="py-3 px-4 text-white max-w-[420px]">
                                                        {t.period}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-200">
                                                        {formatCurrency(t.totalRevenue)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-200">
                                                        {t.totalBookings}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-200">
                                                        {t.totalSeats}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                        {/* --- END: KẾT THÚC PHẦN BỔ SUNG --- */}
                    </>
                )
            ) : isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#e86d28]" />
                    <span className="ml-2 text-gray-400">Loading report...</span>
                </div>
            ) : error ? (
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent>
                        <div className="text-red-400">
                            Error loading report. Please try again later.
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent>
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Top 5 Revenue Movie
                                </h2>
                                <div style={{ width: '100%', height: 340 }}>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={barData}
                                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                        >
                                            <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} />
                                            <YAxis
                                                stroke="#cbd5e1"
                                                fontSize={12}
                                                tickFormatter={formatAxisVND}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                            />
                                            <Bar dataKey="Revenue" fill="#e86d28" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent>
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Bookings by Top 5 Revenue Movies
                                </h2>
                                <div style={{ width: '100%', height: 340 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="Bookings"
                                                nameKey="name"
                                                outerRadius={110}
                                                fill="#8884d8"
                                            >
                                                {pieData.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => `${value} bookings`}
                                            />
                                            <Legend
                                                layout="vertical"
                                                verticalAlign="middle"
                                                align="right"
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent>
                            <h2 className="text-xl font-semibold text-white mb-4">Detailed List</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700/50">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-gray-300">
                                                Movie
                                            </th>
                                            <th className="text-right py-3 px-4 text-gray-300">
                                                Revenue
                                            </th>
                                            <th className="text-right py-3 px-4 text-gray-300">
                                                Bookings
                                            </th>
                                            <th className="text-right py-3 px-4 text-gray-300">
                                                Total Seats
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movies.map((m) => (
                                            <tr
                                                key={m.movieId}
                                                className="border-b border-gray-700/50 hover:bg-gray-700/30"
                                            >
                                                <td className="py-3 px-4 text-white max-w-[420px]">
                                                    {m.movieName}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-200">
                                                    {formatCurrency(m.totalRevenue)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-200">
                                                    {m.totalBookings}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-200">
                                                    {m.totalSeats}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}

export default MovieRevenueReport
