export interface TypeDay {
    id: string
    dayOfWeek: number
    additionalPrice: number
}

export interface UpdateTypeDayRequest {
    additionalPrice: number
}

export interface TypeDayListResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: TypeDay[]
}
