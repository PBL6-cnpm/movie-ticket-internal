import { apiClient } from './api-client'

export interface Movie {
    id: string
    name: string
    poster: string
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

// Get paginated movies (without search)
export const getPaginatedMovies = async (
    params?: Omit<PaginationDto, 'search'>
): Promise<MovieApiResponse> => {
    try {
        const queryParams = new URLSearchParams()

        // Add pagination params
        if (params?.limit) queryParams.append('limit', params.limit.toString())
        if (params?.offset) queryParams.append('offset', params.offset.toString())

        const url = queryParams.toString() ? `/movies?${queryParams.toString()}` : '/movies'
        const response = await apiClient.get(url)

        // Calculate additional pagination metadata
        const responseData = response.data
        if (responseData.success && responseData.data && responseData.data.meta) {
            const { total, limit, offset } = responseData.data.meta
            if (limit && limit > 0) {
                responseData.data.totalPages = Math.ceil(total / limit)
                responseData.currentPage = Math.floor(offset / limit) + 1
            }
        }

        return responseData
    } catch (error) {
        console.error('Error fetching movies:', error)
        throw error
    }
}

// Search movies by name with pagination
export const searchMoviesByName = async (params: {
    name: string
    limit?: number
    offset?: number
}): Promise<MovieApiResponse> => {
    try {
        const queryParams = new URLSearchParams()

        // Add name parameter (required)
        queryParams.append('name', params.name.trim())

        // Add pagination params
        if (params?.limit) queryParams.append('limit', params.limit.toString())
        if (params?.offset) queryParams.append('offset', params.offset.toString())

        const response = await apiClient.get(
            `/movies/search/by-name-movie?${queryParams.toString()}`
        )

        // Calculate additional pagination metadata
        const responseData = response.data
        if (responseData.success && responseData.data && responseData.data.meta) {
            const { total, limit, offset } = responseData.data.meta
            if (limit && limit > 0) {
                responseData.data.totalPages = Math.ceil(total / limit)
                responseData.currentPage = Math.floor(offset / limit) + 1
            }
        }
        console.log(responseData)
        return responseData
    } catch (error) {
        console.error('Error searching movies by name:', error)
        throw error
    }
}

// Get all movies (for simple use cases)
export const getAllMovies = async (): Promise<Movie[]> => {
    try {
        const response = await getPaginatedMovies({ limit: 1000, offset: 0 })
        return response.data?.items || []
    } catch (error) {
        console.error('Error fetching all movies:', error)
        return []
    }
}

// Helper function to get movies by page number (1-based)
export const getMoviesByPage = async (
    page: number = 1,
    pageSize: number = 10,
    searchQuery?: string
): Promise<MovieApiResponse> => {
    const offset = (page - 1) * pageSize

    // Use search API if search query is provided
    if (searchQuery && searchQuery.trim()) {
        return searchMoviesByName({
            name: searchQuery.trim(),
            limit: pageSize,
            offset
        })
    }

    // Otherwise use regular pagination
    return getPaginatedMovies({
        limit: pageSize,
        offset
    })
}

// Helper function to search movies
export const searchMovies = async (
    searchQuery: string,
    page: number = 1,
    pageSize: number = 10
): Promise<MovieApiResponse> => {
    const offset = (page - 1) * pageSize
    return searchMoviesByName({
        name: searchQuery,
        limit: pageSize,
        offset
    })
}
