export interface Refreshment {
    id: string
    name: string
    picture: string
    price: number
    isCurrent: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateRefreshmentRequest {
    name: string
    picture: File | string
    price: number
    isCurrent: boolean
}

export interface UpdateRefreshmentRequest {
    name?: string
    picture?: File | string
    price?: number
    isCurrent?: boolean
}

export interface RefreshmentMeta {
    limit: number
    offset: number
    total: number
    totalPages: number
}

export interface RefreshmentListResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: {
        items: Refreshment[]
        meta: RefreshmentMeta
    }
}
