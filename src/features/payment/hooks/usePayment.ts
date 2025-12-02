import { apiClient } from '@/shared/api/api-client'
import { useMutation } from '@tanstack/react-query'

interface CreatePaymentIntentParams {
    bookingId: string
}

export const useCreatePaymentIntent = () => {
    return useMutation({
        mutationFn: async (params: CreatePaymentIntentParams) => {
            const { data } = await apiClient.post('/bookings/create-payment-intent', {
                bookingId: params.bookingId
            })
            return data
        }
    })
}

export const useCancelPayment = () => {
    return useMutation({
        mutationFn: async (clientSecret: string) => {
            const { data } = await apiClient.post('/bookings/cancel-payment', {
                clientSecret
            })
            return data
        }
    })
}

export const useVerifyPayment = () => {
    return useMutation({
        mutationFn: async (params: { bookingId: string; paymentIntentId: string }) => {
            const { data } = await apiClient.post('/bookings/verify-payment', params)
            return data
        }
    })
}
