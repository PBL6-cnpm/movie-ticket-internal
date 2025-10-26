export interface SpecialDate {
    id: string
    date: string
    additionalPrice: number
}

export interface CreateSpecialDateRequest {
    date: string
    additionalPrice: number
}

export interface UpdateSpecialDateRequest {
    additionalPrice: number
}

export interface SpecialDateListResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: SpecialDate[]
}
