import NotificationPopup from '@/features/booking/components/NotificationPopup'
import SeatSelection from '@/features/booking/components/SeatSelection'
import VoucherModal from '@/features/booking/components/VoucherModal'
import type { HoldBookingPayload } from '@/features/booking/hooks/useHoldBooking'
import { useHoldBooking } from '@/features/booking/hooks/useHoldBooking'
import { useMovieDetail } from '@/features/booking/hooks/useMovieDetail'
import { useRefreshments } from '@/features/booking/hooks/useRefreshments'
import { useSeatLayout } from '@/features/booking/hooks/useSeatLayout'
import { useSelectedSeatsInfo } from '@/features/booking/hooks/useSelectedSeatsInfo'
import { usePublicVouchers } from '@/features/booking/hooks/useVouchers'
import { useBookingStore } from '@/features/booking/stores/booking.store'
import type { SelectedRefreshment } from '@/features/booking/types/refreshment.types'
import type { AppliedVoucher, Voucher } from '@/features/booking/types/voucher.types'
import { useCreatePaymentIntent } from '@/features/payment/hooks/usePayment'
import { useNavigate } from '@tanstack/react-router'
import {
    ArrowLeft,
    Calendar,
    Clock,
    DoorClosed,
    Loader2,
    MapPin,
    Minus,
    Plus,
    Tag,
    Timer,
    Users
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import PageTransition from '@/shared/components/ui/PageTransition'
import { useScrollToTop } from '@/shared/hooks/useScrollToTop'
import { useBranches, useMovieShowTimes } from '@/features/booking/hooks/useBookingApi'

const BookingPage: React.FC = () => {
    console.log('=== BookingPage mounted ===')
    const navigate = useNavigate()
    const { movieId, showtimeId, branchId, date, setBookingState } = useBookingStore()

    const [selectedSeats, setSelectedSeats] = useState<string[]>([])
    const [selectedRefreshments, setSelectedRefreshments] = useState<SelectedRefreshment[]>([])
    const [showVoucherModal, setShowVoucherModal] = useState(false)
    const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null)
    const [notification, setNotification] = useState<{
        message: string
        type?: 'error' | 'info'
    } | null>(null)

    useScrollToTop()

    const { data: movie, isLoading: movieLoading } = useMovieDetail(movieId || '')
    const { data: showTimes = [] } = useMovieShowTimes(movieId || '')
    const { data: seatLayoutData } = useSeatLayout(showtimeId || '')
    const { data: branches = [] } = useBranches()
    const { data: refreshmentsData, isLoading: refreshmentsLoading } = useRefreshments()
    const { totalCost: seatsTotalCost, selectedSeatsInfo } = useSelectedSeatsInfo(
        showtimeId || '',
        selectedSeats
    )
    const hasSelectedSeats = selectedSeats.length > 0
    const isSeatInfoReady = hasSelectedSeats && selectedSeatsInfo.length === selectedSeats.length
    const { data: vouchersData, isLoading: vouchersLoading } = usePublicVouchers()
    const holdBookingMutation = useHoldBooking()
    const createPaymentIntentMutation = useCreatePaymentIntent()

    const isProcessingBooking =
        holdBookingMutation.isPending || createPaymentIntentMutation.isPending
    const processingLabel = holdBookingMutation.isPending
        ? 'Reserving seats...'
        : 'Preparing payment...'

    useEffect(() => {
        if (!movieLoading && (!movieId || !showtimeId)) {
            console.warn('Missing booking info in store, redirecting to home.')
            navigate({ to: '/staff/booking/new' })
        }
    }, [movieId, showtimeId, navigate, movieLoading])

    const refreshmentsTotalCost = useMemo(() => {
        return selectedRefreshments.reduce(
            (total, item) => total + item.refreshment.price * item.quantity,
            0
        )
    }, [selectedRefreshments])

    const subtotalCost = seatsTotalCost + refreshmentsTotalCost
    const voucherDiscount = appliedVoucher?.appliedDiscount || 0
    const totalCost = subtotalCost - voucherDiscount

    const calculateVoucherDiscount = (voucher: Voucher, amount: number): number => {
        if (voucher.minimumOrderValue && amount < voucher.minimumOrderValue) return 0

        if (voucher.maxDiscountValue) {
            return voucher.maxDiscountValue
        }

        if (voucher.discountValue) {
            return voucher.discountValue
        }

        if (voucher.discountPercent) {
            return (amount * voucher.discountPercent) / 100
        }

        return 0
    }

    const handleApplyVoucher = (voucher: Voucher) => {
        const discount = calculateVoucherDiscount(voucher, subtotalCost)
        if (discount > 0) {
            setAppliedVoucher({ voucher, appliedDiscount: discount })
            setShowVoucherModal(false)
        }
    }

    const handleRemoveVoucher = () => setAppliedVoucher(null)

    const currentShowtime = showTimes
        .flatMap((day) => day.times)
        .find((time) => time.id === showtimeId)

    const currentShowtimeGroup = showTimes.find((day) =>
        day.times.some((time) => time.id === showtimeId)
    )

    const sessionDateSource = currentShowtimeGroup?.dayOfWeek.value || date
    const sessionDate = sessionDateSource ? new Date(sessionDateSource) : null
    const formattedSessionDate = sessionDate
        ? sessionDate.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit'
          })
        : null

    const selectedBranch = branchId ? branches.find((branch) => branch.id === branchId) : null
    const roomName = seatLayoutData?.roomName ?? null

    const handleSeatSelect = (seatName: string) => {
        setSelectedSeats((prev) =>
            prev.includes(seatName) ? prev.filter((s) => s !== seatName) : [...prev, seatName]
        )
    }

    const handleRefreshmentQuantityChange = (refreshmentId: string, change: number) => {
        setSelectedRefreshments((prev) => {
            const existingIndex = prev.findIndex((item) => item.refreshment.id === refreshmentId)
            if (existingIndex >= 0) {
                const newQuantity = prev[existingIndex].quantity + change
                return newQuantity <= 0
                    ? prev.filter((_, index) => index !== existingIndex)
                    : prev.map((item, index) =>
                          index === existingIndex ? { ...item, quantity: newQuantity } : item
                      )
            }
            if (change > 0 && refreshmentsData) {
                const refreshment = refreshmentsData.items.find((r) => r.id === refreshmentId)
                if (refreshment) return [...prev, { refreshment, quantity: change }]
            }
            return prev
        })
    }

    const handleBookingConfirm = async () => {
        if (!showtimeId) {
            setNotification({
                message: 'Showtime information is missing. Please select a showtime again.',
                type: 'error'
            })
            return
        }

        if (!hasSelectedSeats) {
            setNotification({
                message: 'Please select at least one seat before continuing.',
                type: 'info'
            })
            return
        }

        if (!isSeatInfoReady) {
            setNotification({
                message: 'Seat information is still loading. Please try again in a moment.',
                type: 'info'
            })
            return
        }

        const seatIds = selectedSeatsInfo.map((seat) => seat.id).filter(Boolean)

        if (seatIds.length === 0) {
            setNotification({
                message:
                    'Unable to identify selected seats. Please re-select your seats and try again.',
                type: 'error'
            })
            return
        }

        const payload: HoldBookingPayload = {
            showTimeId: showtimeId,
            seatIds,
            voucherCode: appliedVoucher?.voucher.code ?? undefined,
            refreshmentsOption: selectedRefreshments
                .filter((item) => item.quantity > 0)
                .map((item) => ({
                    refreshmentId: item.refreshment.id,
                    quantity: item.quantity
                }))
        }

        try {
            const holdResponse = await holdBookingMutation.mutateAsync(payload)

            if (!holdResponse?.success || !holdResponse.data) {
                throw new Error(
                    holdResponse?.message || 'Unable to reserve seats. Please try again.'
                )
            }

            const { bookingId, totalPrice } = holdResponse.data

            const paymentResult = await createPaymentIntentMutation.mutateAsync({
                bookingId
            })

            const clientSecret = paymentResult?.data?.clientSecret

            if (!clientSecret || typeof clientSecret !== 'string') {
                throw new Error('Unable to initialize payment. Please try again.')
            }

            sessionStorage.setItem('payment_client_secret', clientSecret)
            sessionStorage.setItem('booking_id', bookingId)
            sessionStorage.setItem('booking_total_price', String(totalPrice))

            setBookingState({
                bookingId,
                totalPrice,
                movieName: movie.name,
                branchName: selectedBranch?.name,
                time: currentShowtime?.time,
                selectedSeats: selectedSeats.map((s) => ({ seatNumber: s })),
                refreshments: selectedRefreshments.map((r) => ({
                    name: r.refreshment.name,
                    quantity: r.quantity
                }))
            })

            await navigate({ to: '/payment' })
        } catch (error) {
            let errorMessage = 'Failed to proceed with booking. Please try again.'

            if (error && typeof error === 'object') {
                const maybeError = error as { message?: string; data?: { message?: string } }
                if (maybeError.message) {
                    errorMessage = maybeError.message
                } else if (maybeError.data?.message) {
                    errorMessage = maybeError.data.message
                }
            }

            if (errorMessage.toLowerCase().includes('already locked or booked')) {
                errorMessage =
                    'One or more of your selected seats were just taken. Please pick different seats and try again.'
            }

            console.error('Booking confirmation error:', error)
            setNotification({ message: errorMessage, type: 'error' })
        }
    }

    if (movieLoading) {
        return (
            <div className="min-h-screen bg-[#1a2232] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        )
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#1a2232] flex items-center justify-center">
                <div className="text-white text-center">
                    <p className="text-xl">Movie not found</p>
                    <p className="text-gray-400">Your booking session might have expired.</p>
                </div>
            </div>
        )
    }

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60

        if (hours === 0) return `${mins}m`
        if (mins === 0) return `${hours}h`
        return `${hours}h ${mins}m`
    }

    const groupedSeats = selectedSeatsInfo.reduce(
        (acc, seat) => {
            const typeName = seat.type.name
            if (!acc[typeName]) {
                acc[typeName] = { seats: [], price: seat.type.price }
            }
            acc[typeName].seats.push(seat.name)
            return acc
        },
        {} as Record<string, { seats: string[]; price: number }>
    )

    return (
        <>
            {notification && (
                <NotificationPopup
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <PageTransition>
                <div className="min-h-screen bg-[#1a2232] text-white">
                    {/* Header */}
                    <header className="sticky top-0 z-50 bg-[#1a2232]/95 backdrop-blur-sm border-b border-white/10">
                        <div className="container mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => navigate({ to: '/staff/booking/new' })}
                                    className="flex items-center gap-2 text-white hover:text-[#fe7e32] transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back
                                </button>
                                <h1 className="text-xl font-bold">Booking Tickets</h1>
                                <div className="w-20" />
                            </div>
                        </div>
                    </header>

                    <main className="container mx-auto px-4 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Movie Info Sidebar */}
                            <aside className="lg:col-span-1.5">
                                <div className="bg-[#242b3d] rounded-2xl p-6 sticky top-24">
                                    <div className="mb-6 space-y-6">
                                        <div className="flex flex-col items-center text-center gap-4">
                                            <div className="relative w-44 h-64 sm:w-48 sm:h-72 lg:w-56 lg:h-80">
                                                <img
                                                    src={movie.poster}
                                                    alt={movie.name}
                                                    className="w-full h-full object-cover rounded-2xl shadow-xl"
                                                />
                                                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full border border-white/10 bg-[#0f172a]/80 px-3 py-1 text-xs font-semibold text-white shadow-lg z-10">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>T{movie.ageLimit}+</span>
                                                </div>
                                            </div>
                                            <h2 className="text-xl font-bold text-white leading-snug">
                                                {movie.name}
                                            </h2>
                                        </div>
                                        <div className="border-t border-white/10 pt-6">
                                            <h3 className="text-sm font-semibold text-[#fe7e32] mb-4">
                                                Session Details
                                            </h3>
                                            <div className="space-y-4 text-sm text-[#cccccc]">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {formattedSessionDate && (
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-[#fe7e32]" />
                                                            <span className="capitalize">
                                                                {formattedSessionDate}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                                                        <Timer className="w-3.5 h-3.5 text-[#fe7e32]" />
                                                        <span>
                                                            {formatDuration(movie.duration)}
                                                        </span>
                                                    </div>
                                                    {currentShowtime?.time && (
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-[#fe7e32]" />
                                                            <span>{currentShowtime.time}</span>
                                                        </div>
                                                    )}
                                                    {roomName && (
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                                                            <DoorClosed className="w-3.5 h-3.5 text-[#fe7e32]" />
                                                            <span> {roomName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {selectedBranch && (
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-[#fe7e32] mt-0.5" />
                                                        <div className="space-y-1">
                                                            <p className="text-white font-medium leading-tight">
                                                                {selectedBranch.name}
                                                            </p>
                                                            {selectedBranch.address && (
                                                                <p className="text-xs text-[#9aa4b8] leading-tight line-clamp-2">
                                                                    {selectedBranch.address}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary sections */}
                                    {(selectedSeats.length > 0 ||
                                        selectedRefreshments.length > 0) && (
                                        <>
                                            {selectedSeats.length > 0 && (
                                                <div className="border-t border-white/10 pt-6">
                                                    <h3 className="text-sm font-semibold text-[#fe7e32] mb-3">
                                                        Selected Seats ({selectedSeats.length})
                                                    </h3>

                                                    <div className="space-y-2 mb-4">
                                                        {Object.entries(groupedSeats).map(
                                                            ([typeName, info]) => (
                                                                <div
                                                                    key={typeName}
                                                                    className="flex items-center text-sm"
                                                                >
                                                                    <span className="flex-[0.4] text-[#cccccc]">
                                                                        {typeName}
                                                                        <p>
                                                                            (
                                                                            {info.price.toLocaleString(
                                                                                'vi-VN'
                                                                            )}{' '}
                                                                            đ)
                                                                        </p>
                                                                    </span>

                                                                    <span className="flex-[0.6] text-white">
                                                                        {info.seats.join(', ')}
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRefreshments.length > 0 && (
                                                <div className="border-t border-white/10 pt-6">
                                                    <h3 className="text-sm font-semibold text-[#fe7e32] mb-3">
                                                        Refreshments
                                                    </h3>
                                                    <div className="space-y-2 mb-4">
                                                        {selectedRefreshments.map((item) => (
                                                            <div
                                                                key={item.refreshment.id}
                                                                className="flex justify-between items-center text-sm"
                                                            >
                                                                <span className="text-white">
                                                                    {item.refreshment.name}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[#cccccc]">
                                                                        x{item.quantity}
                                                                    </span>
                                                                    <span className="text-[#fe7e32] font-medium">
                                                                        {(
                                                                            item.refreshment.price *
                                                                            item.quantity
                                                                        ).toLocaleString(
                                                                            'vi-VN'
                                                                        )}{' '}
                                                                        đ
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-t border-white/10 pt-3">
                                                {appliedVoucher && (
                                                    <div className="flex justify-between items-center text-sm mb-2">
                                                        <span className="text-[#cccccc]">
                                                            Voucher Discount:
                                                        </span>
                                                        <span className="text-green-400 font-medium">
                                                            -
                                                            {appliedVoucher.appliedDiscount.toLocaleString(
                                                                'vi-VN'
                                                            )}{' '}
                                                            đ
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                                                    <span className="font-semibold text-white">
                                                        Total:
                                                    </span>
                                                    <span className="text-xl font-bold text-[#fe7e32]">
                                                        {totalCost.toLocaleString('vi-VN')} đ
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Voucher & Booking Button */}
                                    {selectedSeats.length > 0 && (
                                        <div className="mt-6">
                                            {appliedVoucher ? (
                                                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Tag className="w-4 h-4 text-green-400" />
                                                                <span className="text-sm font-medium text-white">
                                                                    {appliedVoucher.voucher.name}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-green-400">
                                                                Code: {appliedVoucher.voucher.code}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={handleRemoveVoucher}
                                                            className="px-3 py-1.5 bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition-all text-sm font-medium border border-red-500/30"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowVoucherModal(true)}
                                                    className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 text-sm bg-[#fe7e32]/10 hover:bg-[#fe7e32]/20 text-[#fe7e32] hover:text-white rounded-lg transition-all font-medium border-2 border-[#fe7e32]/30 hover:border-[#fe7e32]"
                                                >
                                                    <Tag className="w-5 h-5" />
                                                    Apply Vouchers
                                                </button>
                                            )}
                                            <button
                                                onClick={handleBookingConfirm}
                                                disabled={!isSeatInfoReady || isProcessingBooking}
                                                className="w-full bg-[#fe7e32] hover:bg-[#e56e29] disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-6 rounded-lg transition-all shadow-lg disabled:shadow-none transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {isProcessingBooking ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        {processingLabel}
                                                    </>
                                                ) : (
                                                    `Book ${selectedSeats.length} Ticket${selectedSeats.length > 1 ? 's' : ''}`
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </aside>

                            {/* Main Content */}
                            <section className="lg:col-span-3 space-y-8">
                                <SeatSelection
                                    showtimeId={showtimeId!}
                                    selectedSeats={selectedSeats}
                                    onSeatSelect={handleSeatSelect}
                                />
                                <div className="bg-[#242b3d] rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-6">
                                        Refreshments
                                    </h3>
                                    {refreshmentsLoading ? (
                                        <div className="text-center py-8">
                                            <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#fe7e32]" />
                                            <p className="text-[#cccccc] mt-2">Loading...</p>
                                        </div>
                                    ) : refreshmentsData?.items.length ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {refreshmentsData.items.map((refreshment) => {
                                                const quantity =
                                                    selectedRefreshments.find(
                                                        (item) =>
                                                            item.refreshment.id === refreshment.id
                                                    )?.quantity || 0
                                                return (
                                                    <div
                                                        key={refreshment.id}
                                                        className="bg-[#1a2232] rounded-lg p-4 flex flex-col"
                                                    >
                                                        <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                                                            <img
                                                                src={refreshment.picture}
                                                                alt={refreshment.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <h4 className="text-white font-medium mb-2 text-sm flex-grow">
                                                            {refreshment.name}
                                                        </h4>
                                                        <p className="text-[#fe7e32] font-bold mb-3">
                                                            {refreshment.price.toLocaleString(
                                                                'vi-VN'
                                                            )}{' '}
                                                            đ
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleRefreshmentQuantityChange(
                                                                            refreshment.id,
                                                                            -1
                                                                        )
                                                                    }
                                                                    disabled={quantity === 0}
                                                                    className="w-8 h-8 rounded-full bg-[#fe7e32] hover:bg-[#e56e29] disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                                                >
                                                                    <Minus className="w-4 h-4 text-white" />
                                                                </button>
                                                                <span className="text-white font-medium w-8 text-center">
                                                                    {quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        handleRefreshmentQuantityChange(
                                                                            refreshment.id,
                                                                            1
                                                                        )
                                                                    }
                                                                    className="w-8 h-8 rounded-full bg-[#fe7e32] hover:bg-[#e56e29] flex items-center justify-center transition-colors"
                                                                >
                                                                    <Plus className="w-4 h-4 text-white" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-[#cccccc]">
                                                No Refreshments Available
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </main>

                    {/* Voucher Modal */}
                    <VoucherModal
                        isOpen={showVoucherModal}
                        onClose={() => setShowVoucherModal(false)}
                        vouchers={vouchersData?.data || []}
                        isLoading={vouchersLoading}
                        totalAmount={subtotalCost}
                        appliedVoucher={appliedVoucher}
                        onApplyVoucher={handleApplyVoucher}
                        onRemoveVoucher={handleRemoveVoucher}
                    />
                </div>
            </PageTransition>
        </>
    )
}

export default BookingPage
