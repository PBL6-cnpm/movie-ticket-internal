export interface Genre {
    id: string
    name: string
}

export interface Actor {
    id: string
    name: string
    picture: string
    description: string | null
    character?: string
    movies: {
        id: string
        name: string
        poster: string
    }[]
    createdAt: string
    updatedAt: string
}

export interface Movie {
    id: string
    name: string
    description: string
    duration: number
    ageLimit: number
    director: string
    trailer: string
    poster: string
    releaseDate: string
    avgRating?: number | null
    averageRating?: number | null
    genres: Genre[]
    actors: Actor[]
    createdAt: string
    updatedAt: string
    status: 'now-showing' | 'coming-soon' | 'ended'
}

export interface ApiListMeta {
    limit: number
    offset: number
    total: number
    totalPages: number
}

export interface ApiListResponse<T> {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: {
        items: T[]
        meta?: ApiListMeta
    }
}

export interface MovieDetailResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: Movie
}

export interface ActorDetailResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: Actor
}
