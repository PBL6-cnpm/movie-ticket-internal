import { apiClient } from './api-client'

// Types
export interface Branch {
    id: string
    name: string
    address: string
    createdAt: string
    updatedAt: string
}

export interface CreateBranchRequest {
    name: string
    address: string
}

export interface UpdateBranchRequest {
    name: string
    address: string
}

export interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

// API functions
export const getAllBranches = async (): Promise<ApiResponse<Branch[]>> => {
    const response = await apiClient.get('/branches')
    return response.data
}

export const getBranchById = async (id: string): Promise<ApiResponse<Branch>> => {
    const response = await apiClient.get(`/branches/${id}`)
    return response.data
}

export const createBranch = async (data: CreateBranchRequest): Promise<ApiResponse<Branch>> => {
    const response = await apiClient.post('/branches', data)
    return response.data
}

export const updateBranch = async (
    id: string,
    data: UpdateBranchRequest
): Promise<ApiResponse<Branch>> => {
    const response = await apiClient.put(`/branches/${id}`, data)
    return response.data
}

export const deleteBranch = async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/branches/${id}`)
    return response.data
}
