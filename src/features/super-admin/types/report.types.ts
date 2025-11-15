export interface MovieRevenue {
    movieId: string
    movieName: string
    totalRevenue: number
    totalBookings: number
    totalSeats: number
}

export interface MovieRevenueApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: MovieRevenue[]
}
