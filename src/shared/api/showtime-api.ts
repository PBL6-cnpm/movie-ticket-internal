import type {
    CreateShowTimeRequest,
    ShowTimeDetailResponse,
    ShowTimeResponse,
    UpdateShowTimeRequest
} from '../types/showtime.types'
import { apiClient } from './api-client'

// Get show times by date
export const getShowTimesByDate = async (date: string): Promise<ShowTimeResponse> => {
    try {
        const response = await apiClient.get(`/show-time/show-date/${date}`)
        return response.data
    } catch (error) {
        console.error('Error fetching show times:', error)
        throw error
    }
}

// Create new show time
export const createShowTime = async (
    data: CreateShowTimeRequest
): Promise<ShowTimeDetailResponse> => {
    try {
        const response = await apiClient.post('/show-time', data)
        return response.data
    } catch (error) {
        console.error('Error creating show time:', error)
        throw error
    }
}

// Update show time
export const updateShowTime = async (
    id: string,
    data: UpdateShowTimeRequest
): Promise<ShowTimeDetailResponse> => {
    try {
        const response = await apiClient.put(`/show-time/${id}`, data)
        return response.data
    } catch (error) {
        console.error('Error updating show time:', error)
        throw error
    }
}

// Delete show time
export const deleteShowTime = async (
    id: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.delete(`/show-time/${id}`)
        return response.data
    } catch (error) {
        console.error('Error deleting show time:', error)
        throw error
    }
}
