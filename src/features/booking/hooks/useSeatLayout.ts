import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'
import type { SeatApiResponse } from '../types/seat.types'

export const useSeatLayout = (showtimeId: string) => {
    return useQuery({
        queryKey: ['seatLayout', showtimeId],
        queryFn: async (): Promise<SeatApiResponse['data']> => {
            const response = await apiClient.get<SeatApiResponse>(
                `/seats/get-with-showtime/${showtimeId}`
            )
            console.log('🪑 API DEBUG - Seat layout response:', response.data)

            if (response.data.success && response.data.data) {
                console.log('✅ API DEBUG - Seat layout success, data:', response.data.data)
                return response.data.data
            }

            console.error('❌ API DEBUG - Failed to fetch seat layout:', response.data)
            throw new Error('Failed to fetch seat layout')
        },
        enabled: !!showtimeId,
        staleTime: 30 * 1000, // 30 seconds - seats can change quickly
        gcTime: 60 * 1000 // 1 minute
    })
}
