import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'
import type { Movie } from '@/shared/types/movies.types'

export interface MoviesParams {
    limit: number
    offset: number
    genres?: string
    year?: string
    sortBy?: string
    sortOrder?: string
    branchId?: string
}

interface MoviesApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: {
        items: Movie[]
        meta: {
            limit: number
            offset: number
            total: number
            totalPages: number
        }
    }
}

interface MoviesResponse {
    movies: Movie[]
    totalCount: number
    totalPages: number
    hasMore: boolean
}

export const useMovies = (params: MoviesParams) => {
    // Build query params
    const queryParams = new URLSearchParams()
    queryParams.append('limit', params.limit.toString())
    queryParams.append('offset', params.offset.toString())

    if (params.genres) queryParams.append('genres', params.genres)
    if (params.year) queryParams.append('year', params.year)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    return useQuery<MoviesResponse>({
        queryKey: ['movies', params],
        queryFn: async () => {
            const response = await apiClient.get<MoviesApiResponse>(
                `/movies?${queryParams.toString()}`
            )
            const apiData = response.data.data

            return {
                movies: apiData.items,
                totalCount: apiData.meta.total,
                totalPages: apiData.meta.totalPages,
                hasMore: apiData.meta.offset + apiData.meta.limit < apiData.meta.total
            }
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}

export const useNowShowingMovies = (params: MoviesParams) => {
    // Build query params
    const queryParams = new URLSearchParams()
    queryParams.append('limit', params.limit.toString())
    queryParams.append('offset', params.offset.toString())

    if (params.genres) queryParams.append('genres', params.genres)
    if (params.year) queryParams.append('year', params.year)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params.branchId) queryParams.append('branchId', params.branchId)

    return useQuery<MoviesResponse>({
        queryKey: ['now-showing-movies', params],
        queryFn: async () => {
            const response = await apiClient.get<MoviesApiResponse>(
                `/movies/now-showing?${queryParams.toString()}`
            )
            const apiData = response.data.data

            return {
                movies: apiData.items,
                totalCount: apiData.meta.total,
                totalPages: apiData.meta.totalPages,
                hasMore: apiData.meta.offset + apiData.meta.limit < apiData.meta.total
            }
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}
