import React, { useCallback, useMemo } from 'react'
import { useSeatLayout } from '../hooks/useSeatLayout'
import type { Seat } from '../types/seat.types'

// --- Icon Components ---
const HeartIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
)

const SeatIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        {...props}
    >
        <path d="M21.5,5.5C20.67,5.5 20,6.17 20,7V17C20,17.83 20.67,18.5 21.5,18.5C22.33,18.5 23,17.83 23,17V7C23,6.17 22.33,5.5 21.5,5.5M2.5,5.5C1.67,5.5 1,6.17 1,7V17C1,17.83 1.67,18.5 2.5,18.5C3.33,18.5 4,17.83 4,17V7C4,6.17 3.33,5.5 2.5,5.5M18,5H6C4.9,5 4,5.9 4,7V19H6V17H18V19H20V7C20,5.9 19.1,5 18,5Z" />
    </svg>
)

// --- Type Definitions ---
interface SeatSelectionProps {
    showtimeId: string
    selectedSeats: string[]
    onSeatSelect: (seatId: string, seatPrice: number) => void
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
    showtimeId,
    selectedSeats,
    onSeatSelect
}) => {
    const { data: seatLayoutData, isLoading, isError, error } = useSeatLayout(showtimeId)

    const { groupedSeats, rowKeys } = useMemo(() => {
        if (!seatLayoutData) {
            return { groupedSeats: {}, rowKeys: [] }
        }

        const groupAndSortSeats = (seats: Seat[]): Record<string, Seat[]> => {
            const sortedSeats = [...seats].sort((a, b) => {
                const rowA = a.name.charAt(0)
                const rowB = b.name.charAt(0)
                const numA = parseInt(a.name.slice(1), 10)
                const numB = parseInt(b.name.slice(1), 10)

                if (rowA < rowB) return -1
                if (rowA > rowB) return 1
                return numA - numB
            })

            return sortedSeats.reduce(
                (acc, seat) => {
                    const row = seat.name.charAt(0)
                    if (!acc[row]) {
                        acc[row] = []
                    }
                    acc[row].push(seat)
                    return acc
                },
                {} as Record<string, Seat[]>
            )
        }

        const grouped = groupAndSortSeats(seatLayoutData.seatLayout.seats)
        const keys = Object.keys(grouped).sort()
        return { groupedSeats: grouped, rowKeys: keys }
    }, [seatLayoutData])

    const handleSeatClick = useCallback(
        (seat: Seat) => {
            console.log('🎫 Seat selected:', {
                seatId: seat.id,
                seatName: seat.name,
                seatType: seat.type.name,
                seatPrice: seat.type.price,
                seatColor: seat.type.color
            })
            onSeatSelect(seat.name, seat.type.price)
        },
        [onSeatSelect]
    )

    // --- Render Logic ---
    if (isLoading) {
        return (
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-white">Loading seat map...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-red-500">
                    Error loading seat map: {error?.message || 'Unknown error'}
                </p>
            </div>
        )
    }

    if (!seatLayoutData) {
        return null
    }

    const { seatLayout, typeSeatList } = seatLayoutData

    return (
        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
            <h4 className="text-lg font-semibold text-white mb-4">Select Your Seats</h4>

            <div className="flex flex-col items-center bg-gradient-to-b from-[#1a2232] to-[#0f1419] p-6 rounded-xl">
                {/* Screen */}
                <div className="mb-6 relative">
                    <div className="h-1.5 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full w-80 mx-auto shadow-[0_0_20px_rgba(255,255,255,0.4)]"></div>
                    <div className="absolute inset-0 h-1.5 bg-gradient-to-r from-transparent via-blue-300/30 to-transparent rounded-full blur-sm"></div>
                </div>
                <p className="text-xs font-semibold text-gray-300 mb-8 tracking-widest">SCREEN</p>

                {/* Seat Grid */}
                <div className="flex flex-col gap-3 w-full overflow-hidden px-4">
                    {rowKeys.map((row) => (
                        <div key={row} className="flex items-center justify-center gap-3 min-w-max">
                            <span className="w-6 text-center font-bold text-sm text-gray-400 mr-2">
                                {row}
                            </span>
                            <div className="flex gap-2">
                                {groupedSeats[row].map((seat) => {
                                    // Check if seat is occupied by comparing seat ID or name with occupied seats array
                                    const isOccupied = seatLayout.occupiedSeats.some(
                                        (occupiedSeat) =>
                                            occupiedSeat.id === seat.id ||
                                            occupiedSeat.name === seat.name
                                    )
                                    const isSelected = selectedSeats.includes(seat.name)

                                    // Debug logging for occupied seats (only for first few seats to avoid spam)
                                    if (seat.name === 'A6') {
                                        console.log('🪑 DEBUG A6 seat:', {
                                            seatId: seat.id,
                                            seatName: seat.name,
                                            isOccupied,
                                            occupiedSeats: seatLayout.occupiedSeats
                                        })
                                    }
                                    const seatNumber = seat.name.slice(1)
                                    const isCoupleSeat = seat.type.name === 'Couple'

                                    let seatColor = seat.type.color
                                    let seatClass = 'hover:scale-105 cursor-pointer'

                                    if (isOccupied) {
                                        seatColor = '#3a4556'
                                        seatClass = 'cursor-not-allowed opacity-50'
                                    }
                                    if (isSelected) {
                                        seatColor = '#fe7e32'
                                        seatClass =
                                            'scale-105 shadow-lg shadow-[#fe7e32]/60 animate-pulse'
                                    }

                                    if (isCoupleSeat) {
                                        return (
                                            <button
                                                key={seat.id}
                                                disabled={isOccupied}
                                                onClick={() => handleSeatClick(seat)}
                                                className={`relative transition-all duration-300 ${seatClass} w-16 h-8`}
                                            >
                                                <div
                                                    className="w-full h-full flex"
                                                    style={{ color: seatColor }}
                                                >
                                                    <SeatIcon className="w-1/2 h-full" />
                                                    <SeatIcon className="w-1/2 h-full" />
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <HeartIcon className="w-4 h-4 text-white/90" />
                                                    <span className="font-bold text-xs text-white">
                                                        {seatNumber}
                                                    </span>
                                                </div>
                                            </button>
                                        )
                                    }

                                    // Regular Seat
                                    return (
                                        <button
                                            key={seat.id}
                                            disabled={isOccupied}
                                            onClick={() => handleSeatClick(seat)}
                                            className={`relative transition-all duration-300 ${seatClass} w-8 h-8`}
                                        >
                                            <SeatIcon
                                                className="w-full h-full"
                                                style={{ color: seatColor }}
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-white">
                                                {seatNumber}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8 text-sm">
                    {typeSeatList.map((type) => (
                        <div key={type.id} className="flex items-center gap-2">
                            <SeatIcon className="w-5 h-5 shadow-md" style={{ color: type.color }} />
                            <span className="text-gray-300 font-medium">{type.name}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <SeatIcon
                            className="w-5 h-5 shadow-lg shadow-[#fe7e32]/50"
                            style={{ color: '#fe7e32' }}
                        />
                        <span className="text-gray-300 font-medium">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <SeatIcon className="w-5 h-5 opacity-50" style={{ color: '#3a4556' }} />
                        <span className="text-gray-300 font-medium">Sold</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SeatSelection
