import type {
    CreateVoucherRequest,
    UpdateVoucherRequest,
    Voucher,
    VoucherListResponse
} from '@/features/super-admin/types/voucher.types'
import { apiClient } from './api-client'

const BASE_URL = '/voucher'

export const voucherApi = {
    // Get all vouchers with pagination only
    getAll: async (params?: { limit?: number; offset?: number }): Promise<VoucherListResponse> => {
        const queryParams: { limit?: number; offset?: number } = {}

        if (params?.limit !== undefined) {
            queryParams.limit = params.limit
        }
        if (params?.offset !== undefined) {
            queryParams.offset = params.offset
        }

        const response = await apiClient.get<VoucherListResponse>(BASE_URL, {
            params: queryParams
        })
        return response.data
    },

    // Search vouchers with keyword, date range, and isPrivate filter
    search: async (params?: {
        keyword?: string
        isPrivate?: boolean
        validFromStart?: string
        validToEnd?: string
        limit?: number
        offset?: number
    }): Promise<VoucherListResponse> => {
        const queryParams: {
            keyword?: string
            isPrivate?: string
            validFromStart?: string
            validToEnd?: string
            limit?: number
            offset?: number
        } = {}

        if (params?.keyword) {
            queryParams.keyword = params.keyword
        }
        if (params?.isPrivate !== undefined) {
            queryParams.isPrivate = params.isPrivate.toString()
        }
        if (params?.validFromStart) {
            queryParams.validFromStart = params.validFromStart
        }
        if (params?.validToEnd) {
            queryParams.validToEnd = params.validToEnd
        }
        if (params?.limit !== undefined) {
            queryParams.limit = params.limit
        }
        if (params?.offset !== undefined) {
            queryParams.offset = params.offset
        }

        const response = await apiClient.get<VoucherListResponse>(`${BASE_URL}/search`, {
            params: queryParams
        })
        return response.data
    },

    // Get voucher by ID
    getById: async (id: string): Promise<Voucher> => {
        const response = await apiClient.get<{ data: Voucher }>(`${BASE_URL}/${id}`)
        return response.data.data
    },

    // Create new voucher
    create: async (data: CreateVoucherRequest): Promise<Voucher> => {
        const response = await apiClient.post<{ data: Voucher }>(BASE_URL, data)
        return response.data.data
    },

    // Update voucher
    update: async (id: string, data: UpdateVoucherRequest): Promise<Voucher> => {
        const response = await apiClient.put<{ data: Voucher }>(`${BASE_URL}/${id}`, data)
        return response.data.data
    },

    // Delete voucher
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`)
    }
}
