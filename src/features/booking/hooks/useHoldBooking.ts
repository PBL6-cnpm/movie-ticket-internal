import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'

// Define ApiResponse locally if not available globally or import it
export interface ApiResponse<T> {
    success: boolean
    statusCode: number
    message: string
    data?: T
}

export interface HoldBookingPayload {
    showTimeId: string
    seatIds: string[]
    voucherCode?: string | null
    refreshmentsOption: Array<{
        refreshmentId: string
        quantity: number
    }>
    phoneNumber?: string
}

export interface HoldBookingData {
    bookingId: string
    totalPrice: number
    message: string
}

const holdBooking = async (payload: HoldBookingPayload): Promise<ApiResponse<HoldBookingData>> => {
    const { data } = await apiClient.post<ApiResponse<HoldBookingData>>('/bookings/hold', payload)
    return data
}

export const useHoldBooking = () => {
    return useMutation({
        mutationFn: holdBooking
    })
}
