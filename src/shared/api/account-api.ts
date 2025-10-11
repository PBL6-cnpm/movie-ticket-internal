import { apiClient } from './api-client'

const BASE_URL = '/accounts'
const BASE_URL_ADMIN = '/accounts/admin'

export interface CreateAdminAccountRequest {
    email: string
    password: string
    fullName: string
    phone: string
    branchId: string
}

export enum AccountStatus {
    ACTIVE = 'active',
    DELETED = 'deleted'
}

export interface UpdateAccountRequest {
    fullName: string
    email: string
    password: string
    phoneNumber: string
    branchId: string
    status: AccountStatus
    roleIds: string[]
}

export interface SearchAdminAccountParams {
    name?: string
    email?: string
    phoneNumber?: string
    limit?: number
    offset?: number
}

export interface GetAllAdminAccountsParams {
    limit?: number
    offset?: number
    search?: string
}

export interface AdminAccount {
    id: string
    email: string
    fullName: string
    phone: string
    branchId: string
    branchName?: string
    createdAt: string
    updatedAt: string
    isActive: boolean
}

export const getAllAdminAccounts = async (params?: GetAllAdminAccountsParams) => {
    const queryParams = new URLSearchParams()

    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const url = queryString ? `${BASE_URL_ADMIN}?${queryString}` : BASE_URL_ADMIN

    return apiClient.get(url, {
        headers: { 'Content-Type': 'application/json' }
    })
}

export const createAdminAccount = async (data: CreateAdminAccountRequest) => {
    return apiClient.post(`${BASE_URL_ADMIN}`, data, {
        headers: { 'Content-Type': 'application/json' }
    })
}

export const updateAccount = async (id: string, data: UpdateAccountRequest) => {
    return apiClient.put(`${BASE_URL}/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    })
}

export const searchAccounts = async (params: SearchAdminAccountParams) => {
    const queryParams = new URLSearchParams()

    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())
    if (params.name) queryParams.append('name', params.name)
    if (params.email) queryParams.append('email', params.email)
    if (params.phoneNumber) queryParams.append('phoneNumber', params.phoneNumber)

    const queryString = queryParams.toString()
    const url = queryString ? `${BASE_URL}/search?${queryString}` : `${BASE_URL}/search`

    return apiClient.get(url, {
        headers: { 'Content-Type': 'application/json' }
    })
}
