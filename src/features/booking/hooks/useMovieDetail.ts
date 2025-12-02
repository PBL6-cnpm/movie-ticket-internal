import type { Movie } from '@/shared/types/movies.types'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'

export const useMovieDetail = (movieId: string) => {
    return useQuery({
        queryKey: ['movie', 'detail', movieId],
        queryFn: async () => {
            console.log('useMovieDetail API call:', `/movies/${movieId}`)
            try {
                const response = await apiClient.get(`/movies/${movieId}`)

                // Check if response structure is correct
                if (!response.data) {
                    throw new Error('No data in response')
                }

                // Handle different response structures
                if (response.data.data) {
                    return response.data.data
                }

                // Maybe the response is direct movie data
                if (response.data.id) {
                    return response.data
                }

                throw new Error('Invalid response structure')
            } catch (error) {
                console.error('useMovieDetail error:', error)
                throw error
            }
        },
        enabled: !!movieId,
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}

export const useSimilarMovies = (genres: string[], currentMovieId: string) => {
    return useQuery({
        queryKey: ['movies', 'similar', genres.join(','), currentMovieId],
        queryFn: async () => {
            const response = await apiClient.get<{ data: { items: Movie[] } }>('/movies', {
                params: {
                    limit: 8,
                    offset: 0,
                    genres: genres.join(',')
                }
            })
            // Filter out the current movie from similar movies
            return response.data.data.items.filter((movie: Movie) => movie.id !== currentMovieId)
        },
        enabled: genres.length > 0,
        staleTime: 10 * 60 * 1000 // 10 minutes
    })
}
