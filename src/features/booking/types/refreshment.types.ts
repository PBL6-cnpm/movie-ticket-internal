// Types for Refreshments API
export interface Refreshment {
    id: string
    name: string
    picture: string
    price: number
    isCurrent: boolean
    createdAt: string
    updatedAt: string
}

export interface RefreshmentApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: {
        items: Refreshment[]
        meta: {
            limit: number
            offset: number
            total: number
            totalPages: number
        }
    }
}

export interface SelectedRefreshment {
    refreshment: Refreshment
    quantity: number
}
