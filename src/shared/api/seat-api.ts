import type {
    CreateSeatRequest,
    SeatsApiResponse,
    SingleSeatApiResponse,
    UpdateSeatRequest
} from '@/features/admin/types/seat.type'
import { apiClient } from './api-client'

const BASE_URL = '/seats'

export const getSeatsByRoom = async (roomId: string): Promise<SeatsApiResponse> => {
    const response = await apiClient.get(`${BASE_URL}/room/${roomId}`)
    console.log(response)
    return response.data
}

export const createSeat = async (data: CreateSeatRequest): Promise<SingleSeatApiResponse> => {
    const response = await apiClient.post(BASE_URL, data)
    return response.data
}

export const updateSeat = async (
    id: string,
    data: UpdateSeatRequest
): Promise<SingleSeatApiResponse> => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data)
    return response.data
}

export const deleteSeat = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`)
    return response.data
}
