import React, { useState } from 'react'
import { useBranchBookings } from '../../../booking/hooks/useBookingApi'
import { format, addDays } from 'date-fns'
import { Search, Calendar, RefreshCw } from 'lucide-react'

import BookingDetailModal from '../components/BookingDetailModal'
import type { Booking } from '../../../booking/hooks/useBookingApi'

const BookingsPage: React.FC = () => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    // Default to next 7 days
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'))

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const limit = 10

    const { data, isLoading, refetch } = useBranchBookings(
        page,
        limit,
        search,
        undefined,
        startDate,
        endDate
    )

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        refetch()
    }

    const handleRowClick = (booking: Booking) => {
        setSelectedBooking(booking)
        setIsModalOpen(true)
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Bookings Management</h1>
                <button
                    onClick={() => refetch()}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-[#1a2232] p-4 rounded-xl border border-white/5">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search by Booking ID, Phone, or Name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#131a27] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#fe7e32]"
                    />
                </form>
                <div className="flex gap-2">
                    <div className="relative">
                        <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value)
                                setPage(1)
                            }}
                            className="bg-[#131a27] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#fe7e32]"
                        />
                    </div>
                    <span className="text-gray-400 self-center">-</span>
                    <div className="relative">
                        <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value)
                                setPage(1)
                            }}
                            className="bg-[#131a27] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#fe7e32]"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#1a2232] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Booking ID</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Movie</th>
                                <th className="px-6 py-4 font-medium">Showtime</th>
                                <th className="px-6 py-4 font-medium">Seats</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                                        Loading bookings...
                                    </td>
                                </tr>
                            ) : !data?.items?.length ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                data.items.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => handleRowClick(booking)}
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                                            {booking.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white">
                                                {booking.account?.fullName || 'Guest'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {booking.account?.phoneNumber || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {booking.showTime?.movie?.name || 'Unknown Movie'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white font-medium">
                                                {booking.showTime?.timeStart
                                                    ? format(
                                                          new Date(booking.showTime.timeStart),
                                                          'dd/MM/yyyy'
                                                      )
                                                    : '-'}
                                            </div>
                                            <div className="text-sm text-[#fe7e32]">
                                                {booking.showTime?.timeStart
                                                    ? format(
                                                          new Date(booking.showTime.timeStart),
                                                          'HH:mm'
                                                      )
                                                    : ''}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {booking.showTime?.room?.name ||
                                                    booking.seats?.[0]?.room?.name ||
                                                    'Unknown Room'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {booking.seats
                                                ?.map((s) => s.name)
                                                .filter(Boolean)
                                                .join(', ') || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#fe7e32] font-medium">
                                            {booking.totalBookingPrice.toLocaleString()} VND
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    booking.status === 'CONFIRMED'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : booking.status === 'PENDING'
                                                          ? 'bg-yellow-500/20 text-yellow-400'
                                                          : 'bg-red-500/20 text-red-400'
                                                }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {format(
                                                new Date(booking.dateTimeBooking),
                                                'dd/MM/yyyy HH:mm'
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.meta.totalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-white/5">
                        <div className="text-sm text-gray-400">
                            Page {page} of {data.meta.totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setPage((p) => Math.max(1, p - 1))
                                }}
                                disabled={page === 1}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded text-sm text-white transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setPage((p) => Math.min(data.meta.totalPages, p + 1))
                                }}
                                disabled={page === data.meta.totalPages}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded text-sm text-white transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <BookingDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                booking={selectedBooking}
            />
        </div>
    )
}

export default BookingsPage
