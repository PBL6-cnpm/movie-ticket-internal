import type {
    BranchRevenueApiResponse,
    BranchRevenueData
} from '@/features/admin/types/revenue.types'
import type {
    MovieRevenue,
    MovieRevenueApiResponse,
    RevenueByTime,
    RevenueByTimeApiResponse
} from '@/features/super-admin/types/report.types'
import { apiClient } from './api-client'

// Fetch revenue statistics grouped by movie
export const getRevenueByMovie = async (params?: {
    startDate?: string
    endDate?: string
}): Promise<MovieRevenue[]> => {
    try {
        const query = new URLSearchParams()
        if (params?.startDate) query.append('startDate', params.startDate)
        if (params?.endDate) query.append('endDate', params.endDate)

        const basePath = '/booking-statistics/revenue-by-movie'
        const url = query.toString() ? `${basePath}?${query.toString()}` : basePath
        const response = await apiClient.get(url)

        const data: MovieRevenueApiResponse = response.data
        if (data && data.success && Array.isArray(data.data)) {
            return data.data
        }

        return []
    } catch (error) {
        console.error('Error fetching movie revenue report:', error)
        throw error
    }
}

// Fetch revenue statistics grouped by time (day/month/quarter/year)
export const getRevenueByTime = async (params: {
    groupBy: 'day' | 'month' | 'quarter' | 'year'
    startDate?: string
    endDate?: string
}): Promise<RevenueByTime[]> => {
    try {
        const query = new URLSearchParams()
        query.append('groupBy', params.groupBy)
        if (params.startDate) query.append('startDate', params.startDate)
        if (params.endDate) query.append('endDate', params.endDate)

        const basePath = '/booking-statistics/revenue-by-time'
        const url = `${basePath}?${query.toString()}`
        const response = await apiClient.get(url)

        const data: RevenueByTimeApiResponse = response.data
        if (data && data.success && Array.isArray(data.data)) {
            return data.data
        }

        return []
    } catch (error) {
        console.error('Error fetching revenue-by-time report:', error)
        throw error
    }
}

// Fetch branch movie statistics for admin
export const getBranchMovieStatistics = async (params?: {
    startDate?: string
    endDate?: string
    branchId?: string
}): Promise<BranchRevenueData> => {
    try {
        const query = new URLSearchParams()

        if (params?.startDate) query.append('startDate', params.startDate)
        if (params?.endDate) query.append('endDate', params.endDate)
        if (params?.branchId) query.append('branchId', params.branchId)

        const basePath = '/booking-statistics/revenue/branch/by-movie'
        const url = query.toString() ? `${basePath}?${query.toString()}` : basePath
        const response = await apiClient.get(url)

        const data: BranchRevenueApiResponse = response.data
        if (data && data.success && data.data) {
            return data.data
        }

        throw new Error('Invalid response from server')
    } catch (error) {
        console.error('Error fetching branch movie statistics:', error)
        throw error
    }
}

// Fetch branch revenue statistics for admin
export const getBranchRevenueStatistics = async (params?: {
    startDate?: string
    endDate?: string
    branchId?: string
    timePeriod?: 'day' | 'month' | 'quarter' | 'year'
}): Promise<BranchRevenueData> => {
    try {
        const query = new URLSearchParams()

        if (params?.startDate) query.append('startDate', params.startDate)
        if (params?.endDate) query.append('endDate', params.endDate)
        if (params?.branchId) query.append('branchId', params.branchId)
        if (params?.timePeriod) query.append('timePeriod', params.timePeriod)

        const basePath = '/booking-statistics/revenue/branch/time'
        const url = query.toString() ? `${basePath}?${query.toString()}` : basePath
        const response = await apiClient.get(url)

        const data: BranchRevenueApiResponse = response.data
        if (data && data.success && data.data) {
            return data.data
        }

        throw new Error('Invalid response from server')
    } catch (error) {
        console.error('Error fetching branch revenue statistics:', error)
        throw error
    }
}
