export interface TypeSeat {
    id: string
    name: string
    price: number
    isCurrent: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateTypeSeatRequest {
    name: string
    price: number
    isCurrent: boolean
}

export interface UpdateTypeSeatRequest {
    name: string
    price: number
    isCurrent: boolean
}

export interface GetTypeSeatsParams {
    limit?: number
    offset?: number
}
