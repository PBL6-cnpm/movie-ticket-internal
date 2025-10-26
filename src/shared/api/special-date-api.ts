import type {
    CreateSpecialDateRequest,
    SpecialDate,
    SpecialDateListResponse,
    UpdateSpecialDateRequest
} from '@/shared/types/special-day/special-date.types'
import { apiClient } from './api-client'

export const specialDateApi = {
    // Get all special dates
    getAll: async (): Promise<SpecialDateListResponse> => {
        const response = await apiClient.get<SpecialDateListResponse>('/special-date')
        return response.data
    },

    // Create new special date
    create: async (data: CreateSpecialDateRequest): Promise<SpecialDate> => {
        const response = await apiClient.post<{ data: SpecialDate }>('/special-date', data)
        return response.data.data
    },

    // Update special date
    update: async (id: string, data: UpdateSpecialDateRequest): Promise<SpecialDate> => {
        const response = await apiClient.put<{ data: SpecialDate }>(`/special-date/${id}`, data)
        return response.data.data
    },

    // Delete special date
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/special-date/${id}`)
    }
}
