import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface BookingState {
    branchId?: string
    movieId?: string
    date?: string
    showtimeId?: string
    redirectUrl?: string
    bookingId?: string
    movieName?: string
    branchName?: string
    time?: string
    selectedSeats?: { seatNumber: string }[]
    refreshments?: { name: string; quantity: number }[]
    totalPrice?: number
}

interface BookingStore extends BookingState {
    setBookingState: (state: BookingState) => void
    clearBookingState: () => void
}

export const useBookingStore = create<BookingStore>()(
    persist(
        (set) => ({
            branchId: undefined,
            movieId: undefined,
            date: undefined,
            showtimeId: undefined,
            redirectUrl: undefined,
            bookingId: undefined,
            movieName: undefined,
            branchName: undefined,
            time: undefined,
            selectedSeats: undefined,
            refreshments: undefined,
            totalPrice: undefined,
            setBookingState: (state) =>
                set((prev) => ({
                    ...prev,
                    ...state
                })),
            clearBookingState: () =>
                set({
                    branchId: undefined,
                    movieId: undefined,
                    date: undefined,
                    showtimeId: undefined,
                    redirectUrl: undefined,
                    bookingId: undefined,
                    movieName: undefined,
                    branchName: undefined,
                    time: undefined,
                    selectedSeats: undefined,
                    refreshments: undefined,
                    totalPrice: undefined
                })
        }),
        {
            name: 'booking-storage',
            storage: createJSONStorage(() => sessionStorage) // Use sessionStorage to clear on browser close
        }
    )
)
