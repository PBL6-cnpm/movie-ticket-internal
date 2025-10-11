import type {
    AdminAccount,
    CreateAdminAccountRequest,
    GetAllAdminAccountsParams,
    SearchAdminAccountParams,
    UpdateAdminAccountRequest
} from '@/features/super-admin/types/account-admin.types'
import type { ApiResponse } from '../types/api-response.types'
import type { IPaginatedResponse } from '../types/paginated-response.types'
import { apiClient } from './api-client'

const BASE_URL = '/accounts'
const BASE_URL_ADMIN = '/accounts/admin'

export const getAllAdminAccounts = async (
    params?: GetAllAdminAccountsParams
): Promise<ApiResponse<IPaginatedResponse<AdminAccount>>> => {
    const queryParams = new URLSearchParams()

    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const url = queryString ? `${BASE_URL_ADMIN}?${queryString}` : BASE_URL_ADMIN

    const response = await apiClient.get(url)
    return response.data
}

export const createAdminAccount = async (
    data: CreateAdminAccountRequest
): Promise<ApiResponse<AdminAccount>> => {
    const response = await apiClient.post(`${BASE_URL_ADMIN}`, data)
    return response.data
}

export const updateAccount = async (
    id: string,
    data: UpdateAdminAccountRequest
): Promise<ApiResponse<AdminAccount>> => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data)
    return response.data
}

export const searchAccounts = async (
    params: SearchAdminAccountParams
): Promise<ApiResponse<IPaginatedResponse<AdminAccount>>> => {
    const queryParams = new URLSearchParams()

    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())
    if (params.name) queryParams.append('name', params.name)
    if (params.email) queryParams.append('email', params.email)
    if (params.phoneNumber) queryParams.append('phoneNumber', params.phoneNumber)

    const queryString = queryParams.toString()
    const url = queryString ? `${BASE_URL}/search?${queryString}` : `${BASE_URL}/search`

    const response = await apiClient.get(url)
    return response.data
}
