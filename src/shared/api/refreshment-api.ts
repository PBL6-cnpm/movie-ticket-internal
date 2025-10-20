import type {
    CreateRefreshmentRequest,
    Refreshment,
    RefreshmentListResponse,
    UpdateRefreshmentRequest
} from '@/features/super-admin/types/refreshment.types'
import { apiClient } from './api-client'

export const refreshmentApi = {
    // Get all refreshments
    getAll: async (params?: {
        limit?: number
        offset?: number
    }): Promise<RefreshmentListResponse> => {
        const response = await apiClient.get<RefreshmentListResponse>('/refreshments', {
            params
        })
        return response.data
    },

    // Get refreshment by ID
    getById: async (id: string): Promise<Refreshment> => {
        const response = await apiClient.get<{ data: Refreshment }>(`/refreshments/${id}`)
        return response.data.data
    },

    // Create new refreshment
    create: async (data: CreateRefreshmentRequest): Promise<Refreshment> => {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('price', data.price.toString())
        // Send as 1 or 0 for better boolean conversion in backend
        formData.append('isCurrent', data.isCurrent ? '1' : '0')

        if (data.picture) {
            formData.append('picture', data.picture)
        }

        const response = await apiClient.post<{ data: Refreshment }>('/refreshments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data.data
    },

    // Update refreshment
    update: async (id: string, data: UpdateRefreshmentRequest): Promise<Refreshment> => {
        console.log('=== UPDATE DATA RECEIVED ===')
        console.log('data.isCurrent:', data.isCurrent)
        console.log('typeof data.isCurrent:', typeof data.isCurrent)

        const formData = new FormData()

        if (data.name) formData.append('name', data.name)
        if (data.price !== undefined) formData.append('price', data.price.toString())
        if (data.isCurrent !== undefined) {
            // Send as 1 or 0 for better boolean conversion in backend
            const isCurrentValue = data.isCurrent ? '1' : '0'
            console.log('isCurrent sent as:', isCurrentValue)
            formData.append('isCurrent', isCurrentValue)
        }
        if (data.picture) formData.append('picture', data.picture)

        // Log all FormData entries
        console.log('=== FORMDATA ENTRIES ===')
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value, typeof value)
        }
        console.log('========================')

        const response = await apiClient.patch<{ data: Refreshment }>(
            `/refreshments/${id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        return response.data.data
    },

    // Delete refreshment
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/refreshments/${id}`)
    }
}
