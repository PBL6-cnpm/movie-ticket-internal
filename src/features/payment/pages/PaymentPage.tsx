import { useBookingStore } from '@/features/booking/stores/booking.store'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useNavigate } from '@tanstack/react-router'
import { AlertCircle, CreditCard, Loader2, Wallet } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import CashPaymentModal from '../components/CashPaymentModal'
import PaymentForm from '../components/PaymentForm'
import { usePayment } from '../hooks/usePayment'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PaymentPage: React.FC = () => {
    const navigate = useNavigate()
    const bookingState = useBookingStore()
    const { createPaymentIntent, clientSecret, error: paymentError, isLoading } = usePayment()
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card')
    const [showCashModal, setShowCashModal] = useState(false)

    // Redirect if no booking data
    useEffect(() => {
        if (
            !bookingState.bookingId ||
            !bookingState.movieId ||
            !bookingState.showtimeId ||
            !bookingState.selectedSeats?.length
        ) {
            navigate({ to: '/staff/booking/new' })
        }
    }, [bookingState, navigate])

    // Create Payment Intent on mount if paying by card
    useEffect(() => {
        if (bookingState.bookingId && paymentMethod === 'card' && !clientSecret) {
            createPaymentIntent(bookingState.bookingId)
        }
    }, [bookingState.bookingId, paymentMethod, clientSecret, createPaymentIntent])

    const handlePaymentSuccess = () => {
        bookingState.clearBookingState()
        navigate({ to: '/payment/success' })
    }

    if (!bookingState.bookingId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
                    <p className="mt-2 text-gray-600">Complete your booking securely</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 md:p-8">
                        {/* Order Summary */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Movie</span>
                                    <span className="font-medium text-gray-900">
                                        {bookingState.movieName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cinema</span>
                                    <span className="font-medium text-gray-900">
                                        {bookingState.branchName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Showtime</span>
                                    <span className="font-medium text-gray-900">
                                        {bookingState.date} - {bookingState.time}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Seats</span>
                                    <span className="font-medium text-gray-900">
                                        {bookingState.selectedSeats
                                            ?.map((s) => s.seatNumber)
                                            .join(', ')}
                                    </span>
                                </div>
                                {(bookingState.refreshments?.length ?? 0) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Refreshments</span>
                                        <span className="font-medium text-gray-900">
                                            {bookingState.refreshments
                                                ?.map((r) => `${r.quantity}x ${r.name}`)
                                                .join(', ')}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-base font-bold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(bookingState.totalPrice || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                                        paymentMethod === 'card'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                                >
                                    <CreditCard className="w-6 h-6" />
                                    <span className="font-medium">Credit Card</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                                        paymentMethod === 'cash'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                                >
                                    <Wallet className="w-6 h-6" />
                                    <span className="font-medium">Cash</span>
                                </button>
                            </div>
                        </div>

                        {/* Payment Interface */}
                        {paymentMethod === 'card' ? (
                            <>
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : paymentError ? (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                                        <AlertCircle className="w-5 h-5" />
                                        <p>{paymentError}</p>
                                    </div>
                                ) : clientSecret ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <PaymentForm clientSecret={clientSecret} />
                                    </Elements>
                                ) : null}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-600 mb-6">
                                    Please collect{' '}
                                    <strong>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(bookingState.totalPrice || 0)}
                                    </strong>{' '}
                                    from the customer.
                                </p>
                                <button
                                    onClick={() => setShowCashModal(true)}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Confirm Cash Payment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CashPaymentModal
                isOpen={showCashModal}
                onClose={() => setShowCashModal(false)}
                bookingId={bookingState.bookingId}
                amount={bookingState.totalPrice || 0}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    )
}

export default PaymentPage
