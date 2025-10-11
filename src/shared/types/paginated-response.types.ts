export interface IPaginatedResponse<T> {
    items: T[]
    meta: IMeta
}

export interface IMeta {
    limit: number
    offset: number
    total: number
    totalPages?: number
}
