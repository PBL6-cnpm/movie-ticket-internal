import type {
    TypeDay,
    TypeDayListResponse,
    UpdateTypeDayRequest
} from '@/shared/types/type-day/type-day.types'
import { apiClient } from './api-client'

export const typeDayApi = {
    // Get all type days
    getAll: async (): Promise<TypeDayListResponse> => {
        const response = await apiClient.get<TypeDayListResponse>('/type-day')
        return response.data
    },

    // Update type day
    update: async (id: string, data: UpdateTypeDayRequest): Promise<TypeDay> => {
        const response = await apiClient.put<{ data: TypeDay }>(`/type-day/${id}`, data)
        return response.data.data
    }
}
