import { apiClient } from '@/shared/api/api-client'
import { X } from 'lucide-react'
import React, { useState } from 'react'

interface CashPaymentModalProps {
    isOpen: boolean
    onClose: () => void
    bookingId: string
    amount: number
    onSuccess: () => void
}

const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
    isOpen,
    onClose,
    bookingId,
    amount,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleConfirm = async () => {
        try {
            setLoading(true)
            setError(null)
            await apiClient.post('/bookings/confirm-cash-payment', { bookingId })
            onSuccess()
        } catch (err: unknown) {
            console.error('Cash payment failed:', err)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (err as any).response?.data?.message || 'Failed to confirm payment'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Cash Payment</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-2">Total Amount to Collect</p>
                        <p className="text-3xl font-bold text-blue-600">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(amount)}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    <p className="text-sm text-gray-500 text-center mb-6">
                        Please confirm that you have received the full amount from the customer.
                        This action cannot be undone.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Payment'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CashPaymentModal
