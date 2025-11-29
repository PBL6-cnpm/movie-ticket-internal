export interface SeatType {
    id: string
    name: string
    price: number
    color: string
}

export interface Seat {
    id: string
    name: string
    type: SeatType
}

export interface OccupiedSeat {
    id: string
    name: string
}

export interface SeatLayout {
    rows: string[]
    cols: number
    occupiedSeats: OccupiedSeat[] // Array of occupied seat objects
    seats: Seat[]
}

export interface SeatLayoutData {
    roomId: string
    roomName: string
    seatLayout: SeatLayout
    totalSeats: number
    availableSeats: number
    occupiedSeats: number // This is a count, the array is in seatLayout
    typeSeatList: SeatType[]
}

export interface SeatApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: SeatLayoutData
}

export interface SelectedSeatInfo {
    id: string
    name: string
    type: SeatType
}
