// Room types
export interface Room {
    id: string
    branchId: string
    name: string
}

export interface CreateRoomRequest {
    name: string
}

export interface UpdateRoomRequest {
    name: string
}

// API Response types
export interface RoomApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: Room[]
}

export interface SingleRoomApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: Room
}
