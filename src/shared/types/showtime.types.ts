export interface Movie {
    id: string
    name: string
    poster: string
}

export interface Room {
    id: string
    name: string
}

export interface ShowTime {
    id: string
    timeStart: string
    showDate: string
    movie: Movie
    room: Room
}

export interface CreateShowTimeRequest {
    movieId: string
    roomId: string
    timeStart: Date
    showDate: Date
}

export interface UpdateShowTimeRequest {
    movieId?: string
    roomId?: string
    timeStart?: Date
    showDate?: Date
}

export interface ShowTimeResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: ShowTime[]
}

export interface ShowTimeDetailResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: ShowTime
}
