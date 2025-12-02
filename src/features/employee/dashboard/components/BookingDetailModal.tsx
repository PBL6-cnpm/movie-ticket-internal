import React from 'react'
import { X, User, Calendar, Clock, MapPin, Film, CreditCard, Armchair } from 'lucide-react'
import { format } from 'date-fns'
import type { Booking } from '../../../booking/hooks/useBookingApi'

interface BookingDetailModalProps {
    isOpen: boolean
    onClose: () => void
    booking: Booking | null
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ isOpen, onClose, booking }) => {
    if (!isOpen || !booking) return null

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    return (
        <div
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl bg-[#1a2232] rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-scale-in"
                onClick={handleContentClick}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#242b3d]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="text-[#fe7e32]" size={24} />
                        Booking Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Customer Info */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <User size={16} />
                            Customer Information
                        </h3>
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/10 overflow-hidden flex-shrink-0 border border-white/20">
                                {booking.account?.avatarUrl ? (
                                    <img
                                        src={booking.account.avatarUrl}
                                        alt={booking.account.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Full Name</label>
                                    <p className="text-white font-medium">
                                        {booking.account?.fullName || 'Guest'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Email</label>
                                    <p
                                        className="text-white font-medium truncate"
                                        title={booking.account?.email}
                                    >
                                        {booking.account?.email || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Phone Number</label>
                                    <p className="text-white font-medium">
                                        {booking.account?.phoneNumber || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Loyalty Points</label>
                                    <p className="text-[#fe7e32] font-medium flex items-center gap-1">
                                        {booking.account?.coin || 0} Coins
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs text-gray-500">Roles</label>
                                    <div className="flex gap-2 mt-1">
                                        {booking.account?.roleNames?.map((role) => (
                                            <span
                                                key={role}
                                                className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30 capitalize"
                                            >
                                                {role}
                                            </span>
                                        )) || <span className="text-gray-500 text-sm">Guest</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Movie & Showtime Info */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <Film size={16} />
                            Movie & Showtime
                        </h3>
                        <div className="flex gap-4">
                            {/* Poster placeholder if we had the URL */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500">Movie</label>
                                    <p className="text-lg font-bold text-[#fe7e32]">
                                        {booking.showTime?.movie?.name || 'Unknown Movie'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} /> Date
                                        </label>
                                        <p className="text-white">
                                            {booking.showTime?.timeStart
                                                ? format(
                                                      new Date(booking.showTime.timeStart),
                                                      'dd/MM/yyyy'
                                                  )
                                                : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} /> Time
                                        </label>
                                        <p className="text-white">
                                            {booking.showTime?.timeStart
                                                ? format(
                                                      new Date(booking.showTime.timeStart),
                                                      'HH:mm'
                                                  )
                                                : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin size={12} /> Room
                                        </label>
                                        <p className="text-white">
                                            {booking.showTime?.room?.name || 'Unknown Room'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seats & Price */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <Armchair size={16} />
                            Seats & Payment
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500">Selected Seats</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {booking.seats?.map((seat) => (
                                        <span
                                            key={seat.id}
                                            className="px-2 py-1 bg-[#fe7e32]/20 text-[#fe7e32] rounded text-sm font-medium border border-[#fe7e32]/30"
                                        >
                                            {seat.name}
                                        </span>
                                    )) || (
                                        <span className="text-gray-500 italic">
                                            No seats selected
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                                <div>
                                    <label className="text-xs text-gray-500">Status</label>
                                    <span
                                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                            booking.status === 'CONFIRMED'
                                                ? 'bg-green-500/20 text-green-400'
                                                : booking.status === 'PENDING'
                                                  ? 'bg-yellow-500/20 text-yellow-400'
                                                  : 'bg-red-500/20 text-red-400'
                                        }`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <label className="text-xs text-gray-500">Total Price</label>
                                    <p className="text-2xl font-bold text-[#fe7e32]">
                                        {booking.totalBookingPrice.toLocaleString()} VND
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingDetailModal
