import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'
import type { RefreshmentApiResponse } from '../types/refreshment.types'

export const useRefreshments = (limit: number = 10, offset: number = 0) => {
    return useQuery({
        queryKey: ['refreshments', limit, offset],
        queryFn: async () => {
            console.log('🍿 API DEBUG - Fetching refreshments')
            const response = await apiClient.get<RefreshmentApiResponse>(
                `/refreshments?limit=${limit}&offset=${offset}`
            )
            console.log('🍿 API DEBUG - Refreshments response:', response.data)

            if (response.data.success && response.data.data) {
                console.log('✅ API DEBUG - Refreshments success, data:', response.data.data)
                return response.data.data
            }

            console.error('❌ API DEBUG - Failed to fetch refreshments:', response.data)
            throw new Error('Failed to fetch refreshments')
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000 // 10 minutes
    })
}
