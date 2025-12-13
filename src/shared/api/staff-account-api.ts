import type {
    CreateStaffAccountRequest,
    StaffAccount,
    StaffAccountListResponse,
    UpdateStaffAccountRequest
} from '@/features/admin/types/staff-account.types'
import { apiClient } from './api-client'

export const staffAccountApi = {
    // Get all staff accounts with pagination
    getAll: async (params?: {
        limit?: number
        offset?: number
        search?: string
    }): Promise<StaffAccountListResponse> => {
        const response = await apiClient.get<StaffAccountListResponse>('/accounts/staff', {
            params
        })
        return response.data
    },

    // Create new staff account
    create: async (data: CreateStaffAccountRequest): Promise<StaffAccount> => {
        console.log('Create')
        const response = await apiClient.post<{ data: StaffAccount }>('/accounts/staff', data)
        return response.data.data
    },

    // Update staff account
    update: async (id: string, data: UpdateStaffAccountRequest): Promise<StaffAccount> => {
        const response = await apiClient.put<{ data: StaffAccount }>(`/accounts/staff/${id}`, data)
        return response.data.data
    }
}
