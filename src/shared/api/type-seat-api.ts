import type {
    CreateTypeSeatRequest,
    GetTypeSeatsParams,
    TypeSeat,
    UpdateTypeSeatRequest
} from '@/features/super-admin/types/type-seat.type'
import type { ApiResponse } from '../types/api-response.types'
import { apiClient } from './api-client'
import type { IPaginatedResponse } from '../types/paginated-response.types'

const BASE_URL = '/type-seats'

export const getAllTypeSeats = async (
    params?: GetTypeSeatsParams
): Promise<ApiResponse<IPaginatedResponse<TypeSeat>>> => {
    const queryParams = new URLSearchParams()

    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL

    const response = await apiClient.get(url)
    return response.data
}

export const createTypeSeat = async (
    data: CreateTypeSeatRequest
): Promise<ApiResponse<TypeSeat>> => {
    const response = await apiClient.post(BASE_URL, data)
    return response.data
}

export const updateTypeSeat = async (
    id: string,
    data: UpdateTypeSeatRequest
): Promise<ApiResponse<TypeSeat>> => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data)
    return response.data
}
