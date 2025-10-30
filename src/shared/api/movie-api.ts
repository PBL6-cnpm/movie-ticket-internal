import type {
    CreateMovieDto,
    Movie,
    MovieApiResponse,
    MovieApiResponseSingle,
    MovieDetailApiResponse,
    PaginationDto,
    UpdateMovieDto
} from '@/features/super-admin/types/movie.types'
import { apiClient } from './api-client'

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

// Get movie detail by ID
export const getMovieById = async (id: string): Promise<MovieDetailApiResponse> => {
    try {
        const response = await apiClient.get(`/movies/${id}`)
        return response.data
    } catch (error) {
        console.error('Error getting movie detail:', error)
        throw error
    }
}

// Create new movie
export const createMovie = async (movieData: CreateMovieDto): Promise<MovieApiResponseSingle> => {
    try {
        const formData = new FormData()

        formData.append('name', movieData.name)
        formData.append('description', movieData.description)
        formData.append('duration', movieData.duration.toString())
        formData.append('ageLimit', movieData.ageLimit.toString())
        formData.append('director', movieData.director)
        if (movieData.trailer) formData.append('trailer', movieData.trailer)
        formData.append('releaseDate', movieData.releaseDate)
        if (movieData.screeningStart) formData.append('screeningStart', movieData.screeningStart)
        if (movieData.screeningEnd) formData.append('screeningEnd', movieData.screeningEnd)

        formData.append('genre', movieData.genre.join(','))

        formData.append('actors', movieData.actors.join(','))

        if (movieData.poster) formData.append('poster', movieData.poster)

        const response = await apiClient.post('/movies', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error('Error creating movie:', error)
        throw error
    }
}

// Update existing movie
export const updateMovie = async (movieData: UpdateMovieDto): Promise<MovieApiResponseSingle> => {
    try {
        const formData = new FormData()

        if (movieData.name !== undefined) formData.append('name', movieData.name)
        if (movieData.description !== undefined)
            formData.append('description', movieData.description)
        if (movieData.duration !== undefined)
            formData.append('duration', movieData.duration.toString())
        if (movieData.ageLimit !== undefined)
            formData.append('ageLimit', movieData.ageLimit.toString())
        if (movieData.director !== undefined) formData.append('director', movieData.director)
        if (movieData.trailer !== undefined) formData.append('trailer', movieData.trailer)
        if (movieData.releaseDate !== undefined)
            formData.append('releaseDate', movieData.releaseDate)
        if (movieData.screeningStart !== undefined)
            formData.append('screeningStart', movieData.screeningStart)
        if (movieData.screeningEnd !== undefined)
            formData.append('screeningEnd', movieData.screeningEnd)

        if (movieData.genre !== undefined) formData.append('genre', movieData.genre.join(','))

        if (movieData.actors !== undefined) formData.append('actors', movieData.actors.join(','))

        if (movieData.poster !== undefined) formData.append('poster', movieData.poster)

        const response = await apiClient.patch(`/movies/${movieData.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error('Error updating movie:', error)
        throw error
    }
}

// Delete movie by ID
export const deleteMovie = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/movies/${id}`)
    } catch (error) {
        console.error('Error deleting movie:', error)
        throw error
    }
}
