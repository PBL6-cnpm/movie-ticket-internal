import Button from '@/shared/components/ui/button'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useBookingStore } from '@/features/booking/stores/booking.store'
import { useEffect, useState } from 'react'

interface PaymentSuccessSearchParams {
    payment_intent?: string
    payment_intent_client_secret?: string
    payment_method?: string
}

export default function PaymentSuccessPage() {
    const navigate = useNavigate()
    const searchParams = useSearch({ strict: false }) as PaymentSuccessSearchParams
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const bookingState = useBookingStore()

    useEffect(() => {
        const paymentIntent = searchParams?.payment_intent
        const paymentIntentClientSecret = searchParams?.payment_intent_client_secret
        const paymentMethod = searchParams?.payment_method

        if ((paymentIntent && paymentIntentClientSecret) || paymentMethod === 'cash') {
            setStatus('success')
            bookingState.clearBookingState()
        } else {
            setStatus('error')
        }
    }, [searchParams, bookingState])

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Verifying payment...</p>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-red-600 text-3xl">✕</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
                    <p className="text-gray-600 mb-8">
                        There was an issue processing your payment. Please try again.
                    </p>
                    <Button onClick={() => navigate({ to: '/staff/booking/new' })}>
                        Back to Booking
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="text-center">
                <div className="mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your payment. Your booking has been confirmed.
                </p>
                <div className="space-y-4">
                    <Button onClick={() => navigate({ to: '/' })} className="w-full sm:w-auto">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}
