export interface Movie {
    id: string
    name: string
    poster: string
    trailer: string
    description: string
    duration: number
    avgRating: number
    releaseDate: string
    director: string
    ageLimit: number
    screeningStart: string
    screeningEnd: string
    genres: { id: string; name: string }[]
    actors: Actor[]
}

export interface Actor {
    id: string
    name: string
    picture?: string
}

export interface Review {
    rating: number
    comment: string
    updatedAt: string
    account: {
        id: string
        fullName: string
        avatarUrl: string
    }
}

export interface MovieDetail extends Movie {
    reviews: Review[]
}

export interface MovieDetailApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: MovieDetail
}

export interface CreateMovieDto {
    name: string
    description: string
    duration: number
    ageLimit: number
    director: string
    trailer: string
    releaseDate: string
    screeningStart?: string
    screeningEnd?: string
    genre: string[]
    actors: string[]
    poster: File
}

export interface UpdateMovieDto extends Partial<CreateMovieDto> {
    id: string
}

export interface MovieApiResponseSingle {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: Movie
}

export interface PaginationDto {
    limit?: number
    offset?: number
    search?: string
}

export interface Meta {
    total: number
    limit: number
    offset: number
    totalPages?: number
}

export interface IPaginatedResponse<T> {
    items: T[]
    meta: Meta
    currentPage?: number
}

export interface MovieApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: IPaginatedResponse<Movie>
}
