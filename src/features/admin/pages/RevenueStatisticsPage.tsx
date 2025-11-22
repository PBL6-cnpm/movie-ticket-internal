'use client'

import { getBranchMovieStatistics, getBranchRevenueStatistics } from '@/shared/api/report-api'
import Button from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { showToast } from '@/shared/utils/toast'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Loader2, TrendingUp } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import type { BranchRevenueData, GroupByType } from '../types/revenue.types'

const RevenueStatisticsPage: React.FC = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0])
    const [branchId, setBranchId] = useState('')
    const [groupBy, setGroupBy] = useState<GroupByType>('day')
    const [viewType, setViewType] = useState<'time' | 'movie'>('time')

    // Utility functions
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num)
    }

    // A vibrant and distinct color palette for charts
    const COLORS = ['#e86d28', '#d35f1a', '#f6a564', '#f0c9a0', '#8fbcd4', '#a3d3a2']

    // Get branchId from localStorage
    useEffect(() => {
        const authStorage = localStorage.getItem('auth-storage')
        console.log('Auth storage from localStorage:', authStorage)

        if (authStorage) {
            try {
                const parsedStorage = JSON.parse(authStorage)
                console.log('Parsed auth storage:', parsedStorage)

                const state = parsedStorage.state
                console.log('State object:', state)

                if (state && state.account) {
                    const account = state.account
                    console.log('Account object:', account)

                    const extractedBranchId = account.branchid || account.branchId
                    console.log('Extracted branchId:', extractedBranchId)

                    if (extractedBranchId) {
                        setBranchId(extractedBranchId)
                        console.log('Successfully set branchId:', extractedBranchId)
                    } else {
                        console.error('BranchId not found in account data')
                        showToast.error('Branch information not found in account')
                    }
                } else {
                    console.error('State or account not found in auth storage')
                    showToast.error('Invalid login data structure')
                }
            } catch (error) {
                console.error('Error parsing auth storage:', error)
                showToast.error('Error reading login information')
            }
        } else {
            console.log('No auth-storage found in localStorage')
            showToast.error('Login information not found')
        }
    }, [])

    // Check for invalid date range and show warning once
    useEffect(() => {
        if (startDate && endDate && startDate > endDate) {
            showToast.error('Start date must be less than or equal to end date')
        }
    }, [startDate, endDate])

    const {
        data: rawRevenueData,
        isLoading,
        error,
        refetch
    } = useQuery<BranchRevenueData>({
        queryKey: ['branchRevenueStats', branchId, startDate, endDate, groupBy, viewType],
        queryFn: async () => {
            if (!branchId) {
                throw new Error('Branch information not found')
            }

            // If invalid date range, return empty data instead of throwing error
            if (startDate && endDate && startDate > endDate) {
                return {
                    branchName: '',
                    branchAddress: '',
                    totalRevenue: 0,
                    totalBookings: 0,
                    totalTicketsSold: 0,
                    totalRefreshmentsRevenue: 0,
                    averageTicketPrice: 0,
                    period: {
                        startDate,
                        endDate
                    },
                    revenueByPeriod: [],
                    movieStats: []
                }
            }

            if (viewType === 'movie') {
                console.log('Calling Movie API with params:', {
                    branchId,
                    startDate,
                    endDate
                })
                const result = await getBranchMovieStatistics({
                    branchId: branchId,
                    startDate,
                    endDate
                })
                console.log('Movie API response:', result)
                return result
            } else {
                console.log('Calling Time API with params:', {
                    branchId,
                    startDate,
                    endDate,
                    timePeriod: groupBy
                })
                const result = await getBranchRevenueStatistics({
                    branchId: branchId,
                    startDate,
                    endDate,
                    timePeriod: groupBy
                })
                console.log('Time API response:', result)
                return result
            }
        },
        enabled: !!branchId
    })

    const revenueData = useMemo(() => {
        return (
            rawRevenueData || {
                branchName: '',
                branchAddress: '',
                totalRevenue: 0,
                totalTicketsSold: 0,
                totalRefreshmentsRevenue: 0,
                averageTicketPrice: 0,
                revenueByPeriod: [],
                movieStats: []
            }
        )
    }, [rawRevenueData])

    // Chart data processing
    const chartData = useMemo(() => {
        if (!revenueData.revenueByPeriod?.length) return []

        const processedData = revenueData.revenueByPeriod.map((item) => {
            let dateLabel = ''

            switch (groupBy) {
                case 'day': {
                    const dateDay = new Date(item.period)
                    dateLabel = dateDay.toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit'
                    })
                    break
                }
                case 'month': {
                    const dateMonth = new Date(item.period)
                    dateLabel = dateMonth.toLocaleDateString('en-US', {
                        month: '2-digit',
                        year: 'numeric'
                    })
                    break
                }
                case 'quarter': {
                    if (item.period.includes('-Q')) {
                        dateLabel = item.period.replace('-', ' ')
                    } else {
                        const date = new Date(item.period)
                        const quarter = Math.floor(date.getMonth() / 3) + 1
                        dateLabel = `${date.getFullYear()} Q${quarter}`
                    }
                    break
                }
                case 'year': {
                    const dateYear = new Date(item.period)
                    dateLabel = dateYear.getFullYear().toString()
                    break
                }
                default:
                    dateLabel = item.period
            }

            return {
                date: dateLabel,
                revenue: item.revenue || 0,
                ticketRevenue: (item.revenue || 0) - (item.refreshmentsRevenue || 0),
                tickets: item.ticketsSold || 0,
                refreshments: item.refreshmentsRevenue || 0
            }
        })

        console.log('Processed chartData:', processedData)
        return processedData
    }, [revenueData, groupBy])

    // Revenue distribution data for pie chart
    const distributionData = useMemo(() => {
        const ticketRevenue =
            (revenueData.totalRevenue || 0) - (revenueData.totalRefreshmentsRevenue || 0)
        return [
            {
                name: 'Ticket Revenue',
                value: ticketRevenue,
                fill: '#e86d28'
            },
            {
                name: 'Refreshments Revenue',
                value: revenueData.totalRefreshmentsRevenue || 0,
                fill: '#8fbcd4'
            }
        ]
    }, [revenueData.totalRevenue, revenueData.totalRefreshmentsRevenue])

    // Movie chart data processing
    const movieChartData = useMemo(() => {
        if (!revenueData.movieStats?.length) {
            return { topMovies: [] }
        }

        const movies = revenueData.movieStats
        const sortedMovies = [...movies].sort((a, b) => b.totalRevenue - a.totalRevenue)
        const top5 = sortedMovies.slice(0, 5)

        const others = sortedMovies.slice(5)
        let topMovies = top5

        if (others.length > 0) {
            const othersRevenue = others.reduce((acc, cur) => acc + cur.totalRevenue, 0)
            const othersBookings = others.reduce((acc, cur) => acc + cur.totalBookings, 0)
            const othersSeats = others.reduce((acc, cur) => acc + cur.totalSeats, 0)

            topMovies = [
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

        return { topMovies }
    }, [revenueData.movieStats])

    const handleApplyFilters = () => {
        refetch()
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <p className="text-sm text-red-800">
                        An error occurred while loading data:{' '}
                        {(error as Error)?.message || 'Unknown error'}
                    </p>
                </div>
            </div>
        )
    }

    // Show loading when waiting for branchId
    if (!branchId) {
        return (
            <div className="flex-1 space-y-4 p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-600">
                            Loading branch information...
                        </p>
                        <p className="text-sm text-gray-500">Please wait a moment</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-3">Revenue Statistics</h1>
                        <p className="text-lg text-gray-300">
                            Manage and track branch revenue statistics
                        </p>
                    </div>
                    {revenueData.branchName && (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 min-w-[300px]">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    <p className="text-sm font-semibold text-white">
                                        {revenueData.branchName}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400 pl-4">
                                    {revenueData.branchAddress}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className={`grid grid-cols-1 gap-6 ${viewType === 'time' ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}
                    >
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">View</label>
                            <select
                                value={viewType}
                                onChange={(e) => setViewType(e.target.value as 'time' | 'movie')}
                                className="h-11 w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer"
                            >
                                <option value="time" className="bg-gray-700 text-white">
                                    By Time
                                </option>
                                <option value="movie" className="bg-gray-700 text-white">
                                    By Movie
                                </option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Start Date
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                End Date
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {viewType === 'time' && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Group By
                                </label>
                                <select
                                    value={groupBy}
                                    onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                                    className="h-11 w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer"
                                >
                                    <option value="day" className="bg-gray-700 text-white">
                                        By Day
                                    </option>
                                    <option value="month" className="bg-gray-700 text-white">
                                        By Month
                                    </option>
                                    <option value="quarter" className="bg-gray-700 text-white">
                                        By Quarter
                                    </option>
                                    <option value="year" className="bg-gray-700 text-white">
                                        By Year
                                    </option>
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                &nbsp;
                            </label>
                            <Button
                                onClick={handleApplyFilters}
                                disabled={isLoading}
                                className="h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Apply'
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400 mb-1">
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                formatCurrency(revenueData.totalRevenue)
                            )}
                        </div>
                        <p className="text-xs text-gray-400">Total revenue for the period</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Total Tickets Sold
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                formatNumber(revenueData.totalTicketsSold)
                            )}
                        </div>
                        <p className="text-xs text-gray-400">Total Tickets Sold</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Refreshments Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400 mb-1">
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                formatCurrency(revenueData.totalRefreshmentsRevenue)
                            )}
                        </div>
                        <p className="text-xs text-gray-400">Revenue from refreshments</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Avg. Ticket Price
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                formatCurrency(revenueData.averageTicketPrice)
                            )}
                        </div>
                        <p className="text-xs text-gray-400">Average ticket price</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            {viewType === 'time' ? (
                // Time-based charts (existing)
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Daily Revenue Trend */}
                        <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-white">
                                    Revenue Trend By{' '}
                                    {groupBy === 'day'
                                        ? 'Day'
                                        : groupBy === 'month'
                                          ? 'Month'
                                          : groupBy === 'quarter'
                                            ? 'Quarter'
                                            : 'Year'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                                        </div>
                                    ) : chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient
                                                        id="colorRevenue"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#e86d28"
                                                            stopOpacity={0.8}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#e86d28"
                                                            stopOpacity={0.1}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    className="opacity-30"
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(value) =>
                                                        `${(value / 1000000).toFixed(1)}M`
                                                    }
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => [
                                                        formatCurrency(value),
                                                        'Revenue'
                                                    ]}
                                                    labelStyle={{ color: '#374151' }}
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        boxShadow:
                                                            '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#e86d28"
                                                    strokeWidth={2}
                                                    fill="url(#colorRevenue)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            <div className="text-center">
                                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                <p>No data available to display chart</p>
                                                <p className="text-sm text-gray-400">
                                                    Please try changing the time filters
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Revenue Distribution */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-white">
                                    Revenue Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                                        </div>
                                    ) : distributionData.some((item) => item.value > 0) ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={distributionData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    dataKey="value"
                                                    label={(entry) =>
                                                        `${((entry.value / (distributionData[0].value + distributionData[1].value)) * 100).toFixed(1)}%`
                                                    }
                                                >
                                                    {distributionData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.fill}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: number) => [
                                                        formatCurrency(value)
                                                    ]}
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        boxShadow:
                                                            '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                                <Legend
                                                    align="center"
                                                    verticalAlign="bottom"
                                                    iconType="rect"
                                                    wrapperStyle={{
                                                        paddingTop: '10px',
                                                        textAlign: 'center',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            <div className="text-center">
                                                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                <p>No data to distribute</p>
                                                <p className="text-sm text-gray-400">
                                                    No revenue in this time period
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tickets and Refreshments Comparison */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white">
                                Tickets & Refreshments Comparison By{' '}
                                {groupBy === 'day'
                                    ? 'Day'
                                    : groupBy === 'month'
                                      ? 'Month'
                                      : groupBy === 'quarter'
                                        ? 'Quarter'
                                        : 'Year'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                                    </div>
                                ) : chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                className="opacity-30"
                                            />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(value) =>
                                                    `${(value / 1000000).toFixed(1)}M`
                                                }
                                            />
                                            <Tooltip
                                                formatter={(value: number, name: string) => {
                                                    if (name === 'ticketRevenue') {
                                                        return [
                                                            formatCurrency(value),
                                                            'Ticket Revenue'
                                                        ]
                                                    } else if (name === 'refreshments') {
                                                        return [
                                                            formatCurrency(value),
                                                            'Refreshments Revenue'
                                                        ]
                                                    }
                                                    return [formatCurrency(value), name]
                                                }}
                                                labelStyle={{ color: '#374151' }}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Bar
                                                dataKey="ticketRevenue"
                                                fill="#e86d28"
                                                radius={[2, 2, 0, 0]}
                                                name="ticketRevenue"
                                            />
                                            <Bar
                                                dataKey="refreshments"
                                                fill="#8fbcd4"
                                                radius={[2, 2, 0, 0]}
                                                name="refreshments"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p>No data to display</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                // Movie-based charts (reusing MovieRevenueReport interface)
                <>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                            <span className="ml-2 text-gray-400">Loading movie statistics...</span>
                        </div>
                    ) : error ? (
                        <Card className="bg-gray-800 border-gray-700">
                            <CardContent>
                                <div className="text-red-400">
                                    Error loading movie statistics. Please try again later.
                                </div>
                            </CardContent>
                        </Card>
                    ) : movieChartData.topMovies.length > 0 ? (
                        <>
                            {/* Movie Revenue Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardContent>
                                        <h2 className="text-xl font-semibold text-white mb-4">
                                            Top 5 Revenue Movie
                                        </h2>
                                        <div style={{ width: '100%', height: 340 }}>
                                            <ResponsiveContainer>
                                                <BarChart
                                                    data={movieChartData.topMovies.map((m) => ({
                                                        name: m.movieName,
                                                        Revenue: m.totalRevenue
                                                    }))}
                                                    margin={{
                                                        top: 20,
                                                        right: 30,
                                                        left: 0,
                                                        bottom: 5
                                                    }}
                                                >
                                                    <XAxis
                                                        dataKey="name"
                                                        stroke="#cbd5e1"
                                                        fontSize={12}
                                                    />
                                                    <YAxis
                                                        stroke="#cbd5e1"
                                                        fontSize={12}
                                                        tickFormatter={(value) =>
                                                            `${(value / 1000000).toFixed(1)}M`
                                                        }
                                                    />
                                                    <Tooltip
                                                        formatter={(value: number) =>
                                                            formatCurrency(value)
                                                        }
                                                        cursor={{
                                                            fill: 'rgba(255, 255, 255, 0.1)'
                                                        }}
                                                        content={({ active, payload }) => {
                                                            if (
                                                                active &&
                                                                payload &&
                                                                payload.length
                                                            ) {
                                                                const data = payload[0].payload
                                                                const movieIndex =
                                                                    movieChartData.topMovies.findIndex(
                                                                        (m) =>
                                                                            m.movieName ===
                                                                            data.name
                                                                    )
                                                                const movie =
                                                                    movieChartData.topMovies[
                                                                        movieIndex
                                                                    ]

                                                                return (
                                                                    <div
                                                                        style={{
                                                                            backgroundColor:
                                                                                'white',
                                                                            border: '1px solid #e5e7eb',
                                                                            borderRadius: '8px',
                                                                            padding: '8px 12px',
                                                                            boxShadow:
                                                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                                        }}
                                                                    >
                                                                        <p
                                                                            style={{
                                                                                color: '#374151',
                                                                                fontWeight: 'bold',
                                                                                marginBottom: '4px'
                                                                            }}
                                                                        >
                                                                            {data.name}
                                                                        </p>
                                                                        <p
                                                                            style={{
                                                                                color: '#374151',
                                                                                margin: 0
                                                                            }}
                                                                        >
                                                                            Revenue:{' '}
                                                                            {formatCurrency(
                                                                                data.Revenue
                                                                            )}
                                                                        </p>
                                                                        {movie?.occupancyRate !=
                                                                            null &&
                                                                            movie.movieId !==
                                                                                'others' && (
                                                                                <p
                                                                                    style={{
                                                                                        color: '#374151',
                                                                                        margin: 0
                                                                                    }}
                                                                                >
                                                                                    Occupancy Rate:{' '}
                                                                                    {movie.occupancyRate.toFixed(
                                                                                        1
                                                                                    )}
                                                                                    %
                                                                                </p>
                                                                            )}
                                                                    </div>
                                                                )
                                                            }
                                                            return null
                                                        }}
                                                    />
                                                    <Bar dataKey="Revenue">
                                                        {movieChartData.topMovies.map(
                                                            (_, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        COLORS[
                                                                            index % COLORS.length
                                                                        ]
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </Bar>
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
                                                        data={movieChartData.topMovies.map((m) => ({
                                                            name: m.movieName,
                                                            Bookings: m.totalBookings
                                                        }))}
                                                        dataKey="Bookings"
                                                        nameKey="name"
                                                        outerRadius={110}
                                                        fill="#8884d8"
                                                    >
                                                        {movieChartData.topMovies.map(
                                                            (_, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        COLORS[
                                                                            index % COLORS.length
                                                                        ]
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value: number) =>
                                                            `${value} bookings`
                                                        }
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

                            {/* Movie Stats Table */}
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
                                                        Movie
                                                    </th>
                                                    <th className="text-right py-3 px-4 text-gray-300">
                                                        Revenue
                                                    </th>
                                                    <th className="text-center py-3 px-4 text-gray-300">
                                                        Bookings
                                                    </th>
                                                    <th className="text-center py-3 px-4 text-gray-300">
                                                        Total Seats
                                                    </th>
                                                    <th className="text-right py-3 px-4 text-gray-300">
                                                        Occupancy Rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(revenueData.movieStats || []).map((movie) => (
                                                    <tr
                                                        key={movie.movieId}
                                                        className="border-b border-gray-700/50 hover:bg-gray-700/30"
                                                    >
                                                        <td className="py-3 px-4 text-white max-w-[420px]">
                                                            {movie.movieName}
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-gray-200">
                                                            {formatCurrency(movie.totalRevenue)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-gray-200">
                                                            {formatNumber(movie.totalBookings)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-gray-200">
                                                            {formatNumber(movie.totalSeats)}
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-gray-200">
                                                            {movie.occupancyRate != null
                                                                ? `${movie.occupancyRate.toFixed(1)}%`
                                                                : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card className="bg-gray-800 border-gray-700">
                            <CardContent>
                                <div className="flex items-center justify-center h-64 text-gray-500">
                                    <div className="text-center">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p>No movie data available</p>
                                        <p className="text-sm text-gray-400">
                                            No movies found for the selected period
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}

export default RevenueStatisticsPage
