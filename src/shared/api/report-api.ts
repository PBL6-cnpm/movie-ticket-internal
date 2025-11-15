import type {
    MovieRevenue,
    MovieRevenueApiResponse
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
