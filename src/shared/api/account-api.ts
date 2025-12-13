import type {
    AdminAccount,
    CreateAdminAccountRequest,
    GetAllAdminAccountsParams,
    SearchAdminAccountParams,
    UpdateAdminAccountRequest
} from '@/features/super-admin/types/account-admin.types'
import type {
    AccountStatus,
    UserAccount,
    UserAccountDetailPayload
} from '@/shared/types/account.types'
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

export interface GetUserAccountsParams {
    limit?: number
    offset?: number
    search?: string
}

export type GetUserAccountDetailParams = GetUserAccountsParams

export const getUserAccounts = async (
    params?: GetUserAccountsParams
): Promise<ApiResponse<IPaginatedResponse<UserAccount>>> => {
    const queryParams = new URLSearchParams()

    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
    if (params?.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const url = queryString ? `${BASE_URL}/users?${queryString}` : `${BASE_URL}/users`

    const response = await apiClient.get(url)
    return response.data
}

export const updateUserAccountStatus = async (
    id: string,
    status: AccountStatus
): Promise<ApiResponse<UserAccount>> => {
    const response = await apiClient.put(`${BASE_URL}/users/${id}/status`, { status })
    return response.data
}

export const getUserAccountDetail = async (
    id: string,
    params?: GetUserAccountDetailParams
): Promise<ApiResponse<UserAccountDetailPayload>> => {
    const queryParams = new URLSearchParams()

    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `${BASE_URL}/users/${id}?${queryString}` : `${BASE_URL}/users/${id}`

    const response = await apiClient.get(url)
    return response.data
}
