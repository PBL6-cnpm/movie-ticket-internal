export interface ApiResponse<T> {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: T | null
}

export interface AxiosSuccessResponse<T> {
    success: boolean
    message?: string
    data?: T
}

export interface AxiosErrorResponse {
    success: false
    statusCode: number
    message?: string
}
