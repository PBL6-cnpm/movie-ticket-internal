import type {
    CreateRoomRequest,
    RoomApiResponse,
    SingleRoomApiResponse,
    UpdateRoomRequest
} from '@/features/admin/types/room.type'
import { apiClient } from './api-client'

const BASE_URL = '/rooms'

export const getAllMyBranchRooms = async (): Promise<RoomApiResponse> => {
    const response = await apiClient.get(`${BASE_URL}/my-branch`)
    return response.data
}

export const createRoom = async (data: CreateRoomRequest): Promise<SingleRoomApiResponse> => {
    const response = await apiClient.post(BASE_URL, data)
    return response.data
}

export const updateRoom = async (
    id: string,
    data: UpdateRoomRequest
): Promise<SingleRoomApiResponse> => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data)
    return response.data
}

export const deleteRoom = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`)
    return response.data
}
