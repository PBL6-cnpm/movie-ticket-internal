import { useMemo } from 'react'
import type { SelectedSeatInfo } from '../types/seat.types'
import { useSeatLayout } from './useSeatLayout'

export const useSelectedSeatsInfo = (showtimeId: string, selectedSeatNames: string[]) => {
    const { data: seatData } = useSeatLayout(showtimeId)

    const selectedSeatsInfo: SelectedSeatInfo[] = useMemo(() => {
        if (!seatData?.seatLayout.seats || !selectedSeatNames.length) return []

        return selectedSeatNames
            .map((seatName) => {
                const seat = seatData.seatLayout.seats.find((s) => s.name === seatName)
                return seat
                    ? {
                          id: seat.id,
                          name: seat.name,
                          type: seat.type
                      }
                    : null
            })
            .filter((seat): seat is SelectedSeatInfo => seat !== null)
    }, [seatData?.seatLayout.seats, selectedSeatNames])

    const totalCost = useMemo(() => {
        return selectedSeatsInfo.reduce((total, seat) => total + seat.type.price, 0)
    }, [selectedSeatsInfo])

    return {
        selectedSeatsInfo,
        totalCost,
        isLoading: !seatData && !!showtimeId
    }
}
