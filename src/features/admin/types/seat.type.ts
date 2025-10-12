// Seat types
export interface TypeSeat {
    id: string
    name: string
}

export interface Seat {
    id: string
    name: string
    typeSeat: TypeSeat
    room: null
}

export interface CreateSeatRequest {
    name: string
    roomId: string
    typeSeatId: string
}

export interface UpdateSeatRequest {
    name: string
    typeSeatId: string
}

// API Response types
export interface SeatsApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: Seat[]
}

export interface SingleSeatApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: Seat
}
