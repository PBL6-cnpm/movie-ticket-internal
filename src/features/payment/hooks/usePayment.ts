import { apiClient } from '@/shared/api/api-client'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

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

export const usePayment = () => {
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const createPaymentIntentMutation = useCreatePaymentIntent()

    const createPaymentIntent = async (bookingId: string) => {
        try {
            setError(null)
            const data = await createPaymentIntentMutation.mutateAsync({ bookingId })
            if (data && data.clientSecret) {
                setClientSecret(data.clientSecret)
                // Store in session storage for persistence
                sessionStorage.setItem('payment_client_secret', data.clientSecret)
            }
        } catch (err: unknown) {
            console.error('Failed to create payment intent:', err)

            const errorMessage =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err as any).response?.data?.message || 'Failed to initialize payment'
            setError(errorMessage)
        }
    }

    return {
        createPaymentIntent,
        clientSecret,
        error,
        isLoading: createPaymentIntentMutation.isPending
    }
}
