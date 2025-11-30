import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'

interface RevenueData {
    totalRevenue: number
    totalBookings: number
    period: 'day' | 'week' | 'month'
}

interface PopularMovie {
    movieId: string
    movieName: string
    bookingCount: number
}

const fetchRevenue = async (period: 'day' | 'week' | 'month'): Promise<RevenueData> => {
    const response = await apiClient.get<{ success: boolean; data: RevenueData }>(
        `/reports/revenue?period=${period}`
    )
    if (response.data.success) {
        return response.data.data
    }
    throw new Error('Failed to fetch revenue')
}

const fetchPopularMovies = async (): Promise<PopularMovie[]> => {
    const response = await apiClient.get<{ success: boolean; data: PopularMovie[] }>(
        '/reports/popular-movies'
    )
    if (response.data.success) {
        return response.data.data
    }
    throw new Error('Failed to fetch popular movies')
}

export const useRevenue = (period: 'day' | 'week' | 'month') => {
    return useQuery({
        queryKey: ['revenue', period],
        queryFn: () => fetchRevenue(period),
        staleTime: 1000 * 60 * 5 // 5 minutes
    })
}

export const usePopularMovies = () => {
    return useQuery({
        queryKey: ['popularMovies'],
        queryFn: fetchPopularMovies,
        staleTime: 1000 * 60 * 15 // 15 minutes
    })
}
