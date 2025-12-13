export enum BookingStatus {
    PENDING = 'PENDING',
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    CONFIRMED = 'CONFIRMED'
}

export interface BookingMovieSummary {
    id: string
    name: string
    poster?: string
}

export interface BookingRoomSummary {
    id: string
    name: string
}

export interface BookingShowTimeSummary {
    id: string
    timeStart: string
    showDate?: string
    movie?: BookingMovieSummary | null
    room?: BookingRoomSummary | null
}

export interface BookingSeatSummary {
    id: string
    name: string
    typeSeat?: {
        id: string
        name: string
    } | null
}

export interface BookingRefreshmentSummary {
    id: string
    name: string
    price: number
}

export interface BookingHistoryItem {
    id: string
    status: BookingStatus
    totalBookingPrice: number
    dateTimeBooking: string
    checkInStatus?: boolean
    qrUrl?: string | null
    showTime: BookingShowTimeSummary
    seats: BookingSeatSummary[]
    refreshmentss?: BookingRefreshmentSummary[]
}
