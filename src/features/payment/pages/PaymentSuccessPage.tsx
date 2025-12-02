import { useBookingStore } from '@/features/booking/stores/booking.store'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import Button from '@/shared/components/ui/button'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PaymentSuccessSearchParams {
    payment_intent?: string
    payment_intent_client_secret?: string
    payment_method?: string
}

function PaymentSuccessPageContent() {
    const navigate = useNavigate()
    const searchParams = useSearch({ strict: false }) as PaymentSuccessSearchParams
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const clearBookingState = useBookingStore((state) => state.clearBookingState)

    useEffect(() => {
        let timeoutId: NodeJS.Timeout

        try {
            const paymentIntent = searchParams?.payment_intent
            const paymentIntentClientSecret = searchParams?.payment_intent_client_secret
            const paymentMethod = searchParams?.payment_method

            // For successful payments, immediately show success without API calls
            if ((paymentIntent && paymentIntentClientSecret) || paymentMethod === 'cash') {
                setStatus('success')

                // Clear booking state after component is fully rendered
                timeoutId = setTimeout(() => {
                    try {
                        // Clear session storage items related to payment
                        sessionStorage.removeItem('payment_client_secret')
                        sessionStorage.removeItem('booking_id')
                        sessionStorage.removeItem('booking_total_price')

                        // Clear booking store state
                        clearBookingState()
                    } catch (error) {
                        console.error('Error clearing booking state:', error)
                    }
                }, 500) // Increased delay to ensure everything is properly loaded
            } else {
                setStatus('error')
            }
        } catch (error) {
            console.error('Error in payment verification:', error)
            setStatus('error')
        }

        // Cleanup function
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }
    }, [searchParams, clearBookingState])
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

export default function PaymentSuccessPage() {
    return (
        <ErrorBoundary
            fallback={
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-red-600 text-3xl">⚠</span>
                            </div>
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">
                            Payment Processing
                        </h1>
                        <p className="text-gray-600 mb-4">
                            Your payment was successful, but we're having trouble displaying the
                            confirmation. Your booking has been completed.
                        </p>
                        <Button onClick={() => (window.location.href = '/staff/booking/new')}>
                            Continue Booking
                        </Button>
                    </div>
                </div>
            }
        >
            <PaymentSuccessPageContent />
        </ErrorBoundary>
    )
}
