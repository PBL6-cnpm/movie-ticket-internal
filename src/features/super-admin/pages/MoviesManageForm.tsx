import {
    createMovie,
    deleteMovie,
    getMovieById,
    getPaginatedMovies,
    searchMoviesByName,
    updateMovie
} from '@/shared/api/movie-api'
import Button from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import Label from '@/shared/components/ui/label'
import { showDeleteConfirm } from '@/shared/utils/confirm'
import { showToast } from '@/shared/utils/toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Edit2, Eye, Loader2, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import type { CreateMovieDto, Movie, MovieApiResponse, UpdateMovieDto } from '../types/movie.types'

interface MovieFormData {
    name: string
    description: string
    duration: number
    ageLimit: number
    director: string
    trailer: string
    releaseDate: string
    screeningStart: string
    screeningEnd: string
    genre: string[]
    actors: string[]
    poster: File | null
}

const MoviesManageForm: React.FC = () => {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isLoadingMovieDetail, setIsLoadingMovieDetail] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [formData, setFormData] = useState<MovieFormData>({
        name: '',
        description: '',
        duration: 0,
        ageLimit: 0,
        director: '',
        trailer: '',
        releaseDate: '',
        screeningStart: '',
        screeningEnd: '',
        genre: [],
        actors: [],
        poster: null
    })

    const pageSize = 10
    const queryClient = useQueryClient()

    // Fetch movies with pagination and search
    const {
        data: moviesData,
        isLoading,
        error
    } = useQuery({
        queryKey: ['movies', currentPage, searchQuery],
        queryFn: async (): Promise<MovieApiResponse> => {
            if (searchQuery.trim()) {
                return searchMoviesByName({
                    name: searchQuery,
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize
                })
            } else {
                return getPaginatedMovies({
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize
                })
            }
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    })

    // Debug: log fetched data to verify structure (genres, description)
    useEffect(() => {
        if (moviesData) {
            console.log('Movies fetched:', moviesData)
        }
    }, [moviesData])

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const toggleDropdown = (movieId: string) => {
        setActiveDropdown(activeDropdown === movieId ? null : movieId)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            duration: 0,
            ageLimit: 0,
            director: '',
            trailer: '',
            releaseDate: '',
            screeningStart: '',
            screeningEnd: '',
            genre: [],
            actors: [],
            poster: null
        })
    }

    const handleCreateMovie = () => {
        resetForm()
        setIsCreateDialogOpen(true)
    }

    const handleEditMovie = async (movie: Movie) => {
        try {
            setIsLoadingMovieDetail(true)
            setSelectedMovie(movie)

            // Get detailed movie information from API
            const movieDetailResponse = await getMovieById(movie.id)
            const movieDetail = movieDetailResponse.data

            // Format the date values for form inputs
            const formatDateForInput = (dateString: string) => {
                if (!dateString) return ''
                return new Date(dateString).toISOString().split('T')[0]
            }

            // Extract genre and actor names from detail
            const genreNames = movieDetail.genres?.map((g) => g.name) || []
            const actorNames = movieDetail.actors?.map((a) => a.name) || []

            setFormData({
                name: movieDetail.name || '',
                description: movieDetail.description || '',
                duration: movieDetail.duration || 0,
                ageLimit: movieDetail.ageLimit || 0,
                director: movieDetail.director || '',
                trailer: movieDetail.trailer || '',
                releaseDate: formatDateForInput(movieDetail.releaseDate),
                screeningStart: formatDateForInput(movieDetail.screeningStart),
                screeningEnd: formatDateForInput(movieDetail.screeningEnd),
                genre: genreNames,
                actors: actorNames,
                poster: null // poster is File, keep null for edit mode
            })

            setIsEditDialogOpen(true)
        } catch (error) {
            console.error('Error loading movie details:', error)
            showToast.error('Failed to load movie details')
        } finally {
            setIsLoadingMovieDetail(false)
        }
    }

    const handleViewMovie = (movie: Movie) => {
        navigate({ to: `/super-admin/movies/${movie.id}` })
    }

    const handleDeleteMovie = (movie: Movie) => {
        showDeleteConfirm({
            title: 'Delete Movie',
            message: '',
            itemName: movie.name,
            onConfirm: async () => {
                try {
                    setIsDeleting(true)

                    // Add a small delay to ensure loading is visible even for fast API responses
                    await new Promise((resolve) => setTimeout(resolve, 500))

                    await deleteMovie(movie.id)
                    showToast.success(`Movie "${movie.name}" deleted successfully`)
                    queryClient.invalidateQueries({ queryKey: ['movies'] })
                } catch (err) {
                    console.error('Failed to delete movie:', err)
                    const apiError = err as {
                        response?: { data?: { message?: string } }
                        message?: string
                    }
                    if (apiError.response?.data?.message) {
                        showToast.error(apiError.response.data.message)
                    } else if (apiError.message) {
                        showToast.error(apiError.message)
                    } else {
                        showToast.error('Failed to delete movie')
                    }
                } finally {
                    setIsDeleting(false)
                }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            showToast.error('Movie name is required')
            return
        }

        if (!formData.description.trim()) {
            showToast.error('Description is required')
            return
        }

        if (!formData.trailer.trim()) {
            showToast.error('Trailer URL is required')
            return
        }

        if (formData.duration <= 0) {
            showToast.error('Duration must be greater than 0')
            return
        }

        if (formData.ageLimit < 0) {
            showToast.error('Age limit must be greater than 0')
            return
        }

        if (!formData.director.trim()) {
            showToast.error('Director is required')
            return
        }

        if (!formData.releaseDate) {
            showToast.error('Release date is required')
            return
        }

        if (formData.genre.length === 0) {
            showToast.error('At least one genre is required')
            return
        }

        if (formData.actors.length === 0) {
            showToast.error('At least one actor is required')
            return
        }

        // For create mode, poster is required
        if (!selectedMovie && !formData.poster) {
            showToast.error('Poster image is required for new movies')
            return
        }

        setIsSubmitting(true)

        try {
            if (selectedMovie) {
                // Update movie
                const updateData: UpdateMovieDto = {
                    id: selectedMovie.id,
                    name: formData.name,
                    description: formData.description,
                    duration: formData.duration,
                    ageLimit: formData.ageLimit,
                    director: formData.director,
                    trailer: formData.trailer,
                    releaseDate: formData.releaseDate,
                    screeningStart: formData.screeningStart || undefined,
                    screeningEnd: formData.screeningEnd || undefined,
                    genre: formData.genre,
                    actors: formData.actors,
                    poster: formData.poster || undefined
                }

                const response = await updateMovie(updateData)

                if (response.success) {
                    showToast.success('Movie updated successfully')
                    setIsEditDialogOpen(false)
                    queryClient.invalidateQueries({ queryKey: ['movies'] })
                } else {
                    showToast.error(response.message || 'Failed to update movie')
                }
            } else {
                // Create new movie
                const createData: CreateMovieDto = {
                    name: formData.name,
                    description: formData.description,
                    duration: formData.duration,
                    ageLimit: formData.ageLimit,
                    director: formData.director,
                    trailer: formData.trailer,
                    releaseDate: formData.releaseDate,
                    screeningStart: formData.screeningStart || undefined,
                    screeningEnd: formData.screeningEnd || undefined,
                    genre: formData.genre,
                    actors: formData.actors,
                    poster: formData.poster! // Non-null assertion since we validated it above
                }

                const response = await createMovie(createData)

                if (response.success) {
                    showToast.success('Movie created successfully')
                    setIsCreateDialogOpen(false)
                    queryClient.invalidateQueries({ queryKey: ['movies'] })
                } else {
                    showToast.error(response.message || 'Failed to create movie')
                }
            }

            resetForm()
            setSelectedMovie(null)
        } catch (error: unknown) {
            console.error('Error saving movie:', error)

            // Handle API error response
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as {
                    response?: { data?: { message?: string } }
                    message?: string
                }
                if (apiError.response?.data?.message) {
                    showToast.error(apiError.response.data.message)
                } else if (apiError.message) {
                    showToast.error(apiError.message)
                } else {
                    showToast.error('An error occurred while saving the movie')
                }
            } else {
                showToast.error('An error occurred while saving the movie')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const movies = moviesData?.data?.items || []
    const total = moviesData?.data?.meta?.total || 0
    const totalPages = Math.ceil(total / pageSize)

    // Generate smart pagination numbers
    const generatePaginationNumbers = () => {
        const delta = 2 // Number of pages to show on each side of current page
        const range = []
        const rangeWithDots = []

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i)
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...')
        } else {
            rangeWithDots.push(1)
        }

        rangeWithDots.push(...range)

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages)
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages)
        }

        // Remove duplicates
        return rangeWithDots.filter((item, index, arr) => {
            if (typeof item === 'number') {
                return arr.indexOf(item) === index
            }
            return true
        })
    }

    return (
        <div className="min-h-screen  space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Movies Management</h1>
                    <p className="text-gray-400 mt-1">Manage movie catalog and information</p>
                </div>
                <Button onClick={handleCreateMovie} className="bg-[#e86d28] hover:bg-[#d35f1a]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Movie
                </Button>
            </div>

            {/* Search Bar */}
            <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search movies by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Movies Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#e86d28]" />
                    <span className="ml-2 text-gray-400">Loading movies...</span>
                </div>
            ) : error ? (
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center text-red-400">
                            Error loading movies. Please try again.
                        </div>
                    </CardContent>
                </Card>
            ) : movies.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center text-gray-400">
                            {searchQuery
                                ? 'No movies found matching your search.'
                                : 'No movies available.'}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Results Summary */}
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">
                            Showing {movies.length} of {total} movies
                            {searchQuery && ` for "${searchQuery}"`}
                        </p>
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>

                    {/* Movies Table */}
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700/50">
                                        <tr>
                                            <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                                                Poster
                                            </th>
                                            <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                                                Name
                                            </th>
                                            <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                                                Description
                                            </th>
                                            <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                                                Director
                                            </th>
                                            <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                                                Release Date
                                            </th>
                                            <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                                                Genres
                                            </th>
                                            <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movies.map((movie, index) => (
                                            <tr
                                                key={movie.id}
                                                className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                                                    index % 2 === 0
                                                        ? 'bg-gray-800/20'
                                                        : 'bg-gray-800/10'
                                                }`}
                                            >
                                                {/* Poster */}
                                                <td className="py-4 px-6">
                                                    <div className="w-12 h-16 rounded overflow-hidden bg-gray-700">
                                                        <img
                                                            src={
                                                                movie.poster ||
                                                                '/placeholder-movie.jpg'
                                                            }
                                                            alt={movie.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target =
                                                                    e.target as HTMLImageElement
                                                                target.src =
                                                                    '/placeholder-movie.jpg'
                                                            }}
                                                        />
                                                    </div>
                                                </td>

                                                {/* Name */}
                                                <td className="py-4 px-6">
                                                    <div className="font-medium text-white max-w-[200px]">
                                                        <p
                                                            className="line-clamp-2"
                                                            title={movie.name}
                                                        >
                                                            {movie.name}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Description */}
                                                <td className="py-4 px-6">
                                                    <div className="text-gray-300 text-sm max-w-[300px]">
                                                        <p
                                                            className="line-clamp-3"
                                                            title={movie.description || ''}
                                                        >
                                                            {movie.description ||
                                                                'No description available'}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Director */}
                                                <td className="py-4 px-6">
                                                    <span className="text-gray-300 text-sm">
                                                        {movie.director || 'N/A'}
                                                    </span>
                                                </td>

                                                {/* Release Date */}
                                                <td className="py-4 px-6">
                                                    <span className="text-gray-300 text-sm">
                                                        {movie.releaseDate
                                                            ? new Date(
                                                                  movie.releaseDate
                                                              ).toLocaleDateString('vi-VN')
                                                            : 'N/A'}
                                                    </span>
                                                </td>

                                                {/* Genres */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {movie.genres && movie.genres.length > 0 ? (
                                                            <>
                                                                {movie.genres
                                                                    .slice(0, 2)
                                                                    .map((genre) => (
                                                                        <span
                                                                            key={genre.id}
                                                                            className="text-xs bg-blue-600/20 border border-blue-500/30 text-blue-400 px-2 py-1 rounded-full"
                                                                        >
                                                                            {genre.name}
                                                                        </span>
                                                                    ))}
                                                                {movie.genres.length > 2 && (
                                                                    <span className="text-xs text-gray-400 px-1">
                                                                        +{movie.genres.length - 2}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">
                                                                No genres
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-6">
                                                    <div className="relative">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => toggleDropdown(movie.id)}
                                                            className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 h-8 w-8 p-0"
                                                            title="More actions"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>

                                                        {/* Dropdown Menu */}
                                                        {activeDropdown === movie.id && (
                                                            <div
                                                                ref={dropdownRef}
                                                                className="absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1"
                                                            >
                                                                {/* Arrow pointing to button - positioned to align with center of 3-dot button */}
                                                                <div className="absolute -top-2 right-[36px] w-4 h-4 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>

                                                                <button
                                                                    onClick={() => {
                                                                        handleViewMovie(movie)
                                                                        setActiveDropdown(null)
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Eye className="w-4 h-4 text-blue-400" />
                                                                    View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handleEditMovie(movie)
                                                                        setActiveDropdown(null)
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Edit2 className="w-4 h-4 text-yellow-400" />
                                                                    Edit Movie
                                                                </button>
                                                                <div className="border-t border-gray-700 my-1" />
                                                                <button
                                                                    onClick={() => {
                                                                        handleDeleteMovie(movie)
                                                                        setActiveDropdown(null)
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete Movie
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="text-gray-300 border-gray-600 hover:bg-gray-700"
                            >
                                Previous
                            </Button>

                            {generatePaginationNumbers().map((pageNum, index) => {
                                if (pageNum === '...') {
                                    return (
                                        <span
                                            key={`dots-${index}`}
                                            className="px-3 py-2 text-gray-400"
                                        >
                                            ...
                                        </span>
                                    )
                                }

                                const page = pageNum as number
                                const isActive = currentPage === page

                                return (
                                    <Button
                                        key={page}
                                        variant={isActive ? 'default' : 'outline'}
                                        onClick={() => setCurrentPage(page)}
                                        className={
                                            isActive
                                                ? 'bg-[#e86d28] hover:bg-[#d35f1a] text-white'
                                                : 'text-gray-300 border-gray-600 hover:bg-gray-700'
                                        }
                                    >
                                        {page}
                                    </Button>
                                )
                            })}

                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                }
                                disabled={currentPage === totalPages}
                                className="text-gray-300 border-gray-600 hover:bg-gray-700"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Global Loading Overlay for Submit Actions */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-gray-800/95 rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl border border-gray-700">
                        <Loader2 className="w-10 h-10 animate-spin text-[#e86d28]" />
                        <span className="text-white font-medium text-lg">
                            {selectedMovie ? 'Updating movie...' : 'Creating movie...'}
                        </span>
                        <span className="text-gray-400 text-sm">
                            Please wait while we process your request
                        </span>
                    </div>
                </div>
            )}

            {/* Global Loading Overlay for Delete Actions */}
            {isDeleting && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-gray-800/95 rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl border border-gray-700">
                        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                        <span className="text-white font-medium text-lg">Deleting movie...</span>
                        <span className="text-gray-400 text-sm">
                            Please wait while we delete the movie
                        </span>
                    </div>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {(isCreateDialogOpen || isEditDialogOpen) && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <h2 className="text-2xl font-bold mb-6 text-white">
                            {selectedMovie ? 'Edit Movie' : 'Add New Movie'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Movie Name */}
                                <div>
                                    <Label htmlFor="name" className="text-white">
                                        Movie Name*
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Enter movie name"
                                        className="bg-gray-700 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Director */}
                                <div>
                                    <Label htmlFor="director" className="text-white">
                                        Director*
                                    </Label>
                                    <Input
                                        id="director"
                                        value={formData.director}
                                        onChange={(e) =>
                                            setFormData({ ...formData, director: e.target.value })
                                        }
                                        placeholder="Enter director name"
                                        className="bg-gray-700 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <Label htmlFor="duration" className="text-white">
                                        Duration (minutes)*
                                    </Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                duration: parseInt(e.target.value) || 0
                                            })
                                        }
                                        placeholder="Enter duration in minutes"
                                        className="bg-gray-700 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Age Limit */}
                                <div>
                                    <Label htmlFor="ageLimit" className="text-white">
                                        Age Limit*
                                    </Label>
                                    <Input
                                        id="ageLimit"
                                        type="number"
                                        min="0"
                                        value={formData.ageLimit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                ageLimit: parseInt(e.target.value) || 0
                                            })
                                        }
                                        placeholder="Enter age limit"
                                        className="bg-gray-700 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Release Date */}
                                <div>
                                    <Label htmlFor="releaseDate" className="text-white">
                                        Release Date*
                                    </Label>
                                    <Input
                                        id="releaseDate"
                                        type="date"
                                        value={formData.releaseDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                releaseDate: e.target.value
                                            })
                                        }
                                        className="bg-gray-700 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Trailer URL */}
                                <div>
                                    <Label htmlFor="trailer" className="text-white">
                                        Trailer URL*
                                    </Label>
                                    <Input
                                        id="trailer"
                                        value={formData.trailer}
                                        onChange={(e) =>
                                            setFormData({ ...formData, trailer: e.target.value })
                                        }
                                        placeholder="Enter trailer URL"
                                        className="bg-gray-700 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Screening Start */}
                                <div>
                                    <Label htmlFor="screeningStart" className="text-white">
                                        Screening Start Date
                                    </Label>
                                    <Input
                                        id="screeningStart"
                                        type="date"
                                        value={formData.screeningStart}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                screeningStart: e.target.value
                                            })
                                        }
                                        className="bg-gray-700 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Screening End */}
                                <div>
                                    <Label htmlFor="screeningEnd" className="text-white">
                                        Screening End Date
                                    </Label>
                                    <Input
                                        id="screeningEnd"
                                        type="date"
                                        value={formData.screeningEnd}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                screeningEnd: e.target.value
                                            })
                                        }
                                        className="bg-gray-700 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Description - Full width */}
                            <div>
                                <Label htmlFor="description" className="text-white">
                                    Description*
                                </Label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Enter movie description"
                                    rows={4}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e86d28] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Genres */}
                            <div>
                                <Label htmlFor="genres" className="text-white">
                                    Genres* (comma separated)
                                </Label>
                                <Input
                                    id="genres"
                                    value={formData.genre.join(', ')}
                                    onChange={(e) => {
                                        const genres = e.target.value
                                            .split(',')
                                            .map((g) => g.trim())
                                            .filter((g) => g)
                                        setFormData({ ...formData, genre: genres })
                                    }}
                                    placeholder="e.g. Action, Drama, Comedy"
                                    className="bg-gray-700 border-gray-600 text-white"
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Separate multiple genres with commas
                                </p>
                            </div>

                            {/* Actors */}
                            <div>
                                <Label htmlFor="actors" className="text-white">
                                    Actors* (comma separated)
                                </Label>
                                <Input
                                    id="actors"
                                    value={formData.actors.join(', ')}
                                    onChange={(e) => {
                                        const actors = e.target.value
                                            .split(',')
                                            .map((a) => a.trim())
                                            .filter((a) => a)
                                        setFormData({ ...formData, actors: actors })
                                    }}
                                    placeholder="e.g. John Doe, Jane Smith, Bob Johnson"
                                    className="bg-gray-700 border-gray-600 text-white"
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Separate multiple actor names with commas
                                </p>
                            </div>

                            {/* Poster Upload */}
                            <div>
                                <Label htmlFor="poster" className="text-white">
                                    Poster Image{!selectedMovie && '*'}
                                </Label>
                                <input
                                    id="poster"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null
                                        setFormData({ ...formData, poster: file })
                                    }}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e86d28] text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#e86d28] file:text-white file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    {selectedMovie
                                        ? 'Upload a new poster image (optional for editing)'
                                        : 'Upload a poster image (required for new movies)'}
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex space-x-4 justify-end pt-4 border-t border-gray-600">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false)
                                        setIsEditDialogOpen(false)
                                        setSelectedMovie(null)
                                        resetForm()
                                    }}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#e86d28] hover:bg-[#d35f1a]"
                                    disabled={isLoadingMovieDetail || isSubmitting}
                                >
                                    {isLoadingMovieDetail ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Loading...
                                        </>
                                    ) : isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {selectedMovie ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : selectedMovie ? (
                                        'Update Movie'
                                    ) : (
                                        'Create Movie'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MoviesManageForm
