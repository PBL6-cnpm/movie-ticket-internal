import { getMovieById } from '@/shared/api/movie-api'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Clock, Play, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function MovieDetailPage() {
    const params = useParams({ strict: false })
    const id = params.id as string
    const navigate = useNavigate()
    const [isTrailerOpen, setIsTrailerOpen] = useState(false)
    const [isPageLoaded, setIsPageLoaded] = useState(false)
    const [showModal, setShowModal] = useState(false)

    // Scroll to top when component mounts or movie ID changes
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [id])

    // Add page load animation delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoaded(true)
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isTrailerOpen) {
                closeModal()
            }
        }

        if (isTrailerOpen) {
            document.addEventListener('keydown', handleEscKey)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
            // Show modal with delay for animation
            setTimeout(() => setShowModal(true), 10)
        } else {
            document.body.style.overflow = 'unset'
            setShowModal(false)
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey)
            document.body.style.overflow = 'unset'
        }
    }, [isTrailerOpen])

    const openModal = () => {
        setIsTrailerOpen(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setTimeout(() => setIsTrailerOpen(false), 300) // Delay to allow exit animation
    }

    const {
        data: movieResponse,
        isLoading,
        error
    } = useQuery({
        queryKey: ['movie', id],
        queryFn: () => getMovieById(id),
        enabled: !!id
    })

    const movie = movieResponse?.data

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-32 mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <div className="aspect-[3/4] bg-gray-700 rounded-lg"></div>
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-10 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-700 rounded"></div>
                                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate({ to: '/super-admin/movies' })}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
                    >
                        <ArrowLeft size={20} />
                        Back to Movies
                    </button>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-400 mb-4">
                            Error Loading Movie
                        </h1>
                        <p className="text-gray-400">
                            Failed to load movie details. Please try again.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const convertYouTubeUrl = (url: string) => {
        if (!url) return ''

        // Extract video ID from various YouTube URL formats
        const regex =
            /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
        const match = url.match(regex)

        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`
        }

        return url // Fallback to original URL
    }

    return (
        <div className="min-h-screen text-white p-4">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate({ to: '/super-admin/movies' })}
                    className={`flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-all duration-500 ${
                        isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
                >
                    <ArrowLeft size={18} />
                    Back to Movies
                </button>

                {/* Main Content */}
                <div
                    className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-700 ${
                        isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                >
                    {/* Movie Poster */}
                    <div className="lg:col-span-1">
                        <div
                            className={`sticky top-6 transition-all duration-700 delay-200 ${
                                isPageLoaded
                                    ? 'opacity-100 scale-100 rotate-0'
                                    : 'opacity-0 scale-95 -rotate-1'
                            }`}
                        >
                            <img
                                src={movie.poster}
                                alt={movie.name}
                                className="w-full aspect-[3/4] object-cover rounded-lg shadow-xl transform transition-transform duration-300 hover:scale-105"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src =
                                        'https://via.placeholder.com/400x600/374151/9CA3AF?text=No+Image'
                                }}
                            />
                        </div>
                    </div>

                    {/* Movie Details */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Title */}
                        <div
                            className={`transition-all duration-700 delay-300 ${
                                isPageLoaded
                                    ? 'opacity-100 translate-x-0'
                                    : 'opacity-0 translate-x-8'
                            }`}
                        >
                            <h1 className="text-3xl font-bold mb-3">{movie.name}</h1>
                        </div>

                        {/* Movie Info Grid */}
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-800 rounded-lg transition-all duration-700 delay-400 ${
                                isPageLoaded
                                    ? 'opacity-100 translate-y-0 scale-100'
                                    : 'opacity-0 translate-y-4 scale-95'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-blue-400" />
                                <span className="text-sm">{formatDuration(movie.duration)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-green-400" />
                                <span className="text-sm">{formatDate(movie.releaseDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-purple-400" />
                                <span className="text-sm">Director: {movie.director}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-400 font-semibold text-sm">
                                    Age Limit:
                                </span>
                                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                                    {movie.ageLimit}+
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-cyan-400" />
                                <span className="text-sm">
                                    Screening Start:{' '}
                                    {movie.screeningStart ? formatDate(movie.screeningStart) : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-red-400" />
                                <span className="text-sm">
                                    Screening End:{' '}
                                    {movie.screeningEnd ? formatDate(movie.screeningEnd) : ''}
                                </span>
                            </div>
                        </div>

                        {/* Trailer Section */}
                        <div
                            className={`space-y-3 transition-all duration-700 delay-500 ${
                                isPageLoaded
                                    ? 'opacity-100 translate-x-0'
                                    : 'opacity-0 -translate-x-8'
                            }`}
                        >
                            <h2 className="text-xl font-semibold">Watch Trailer</h2>
                            <button
                                onClick={() => openModal()}
                                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full md:w-auto"
                            >
                                <div className="flex items-center gap-3 px-5 py-3">
                                    <div className="relative">
                                        <Play size={20} className="text-white drop-shadow-lg" />
                                        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                                    </div>
                                    <span className="text-white font-semibold">Watch Trailer</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            </button>
                        </div>

                        {/* Description */}
                        <div
                            className={`space-y-3 transition-all duration-700 delay-600 ${
                                isPageLoaded
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-4'
                            }`}
                        >
                            <h2 className="text-xl font-semibold">Description</h2>
                            <p className="text-gray-300 leading-relaxed text-sm">
                                {movie.description}
                            </p>
                        </div>

                        {/* Genres */}
                        <div
                            className={`space-y-3 transition-all duration-700 delay-700 ${
                                isPageLoaded
                                    ? 'opacity-100 translate-x-0'
                                    : 'opacity-0 translate-x-8'
                            }`}
                        >
                            <h2 className="text-xl font-semibold">Genres</h2>
                            <div className="flex flex-wrap gap-2">
                                {movie.genres.map((genre, index) => (
                                    <span
                                        key={genre.id}
                                        className={`bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded-full text-xs transition-all duration-500 hover:scale-110 ${
                                            isPageLoaded
                                                ? 'opacity-100 translate-y-0'
                                                : 'opacity-0 translate-y-2'
                                        }`}
                                        style={{ transitionDelay: `${800 + index * 100}ms` }}
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Actors */}
                        <div
                            className={`space-y-3 transition-all duration-700 delay-900 ${
                                isPageLoaded
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-4'
                            }`}
                        >
                            <h2 className="text-xl font-semibold">Cast</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {movie.actors.map((actor, index) => (
                                    <div
                                        key={actor.id}
                                        className={`text-center transition-all duration-500 hover:scale-105 ${
                                            isPageLoaded
                                                ? 'opacity-100 translate-y-0'
                                                : 'opacity-0 translate-y-4'
                                        }`}
                                        style={{ transitionDelay: `${1000 + index * 100}ms` }}
                                    >
                                        <div className="aspect-square rounded-full overflow-hidden mb-2 bg-gray-700 w-16 h-16 mx-auto">
                                            <img
                                                src={actor.picture}
                                                alt={actor.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-xs font-medium">{actor.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews */}
                        <div
                            className={`space-y-3 transition-all duration-700 delay-1000 ${
                                isPageLoaded
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-4'
                            }`}
                        >
                            <h2 className="text-xl font-semibold">Reviews</h2>
                            <div className="space-y-3">
                                {movie.reviews.length > 0 ? (
                                    movie.reviews.map((review, index) => (
                                        <div
                                            className={`bg-gray-800 p-3 rounded-lg transition-all duration-500 hover:scale-105 hover:bg-gray-700 ${
                                                isPageLoaded
                                                    ? 'opacity-100 translate-x-0'
                                                    : 'opacity-0 translate-x-4'
                                            }`}
                                            key={index}
                                            style={{ transitionDelay: `${1100 + index * 200}ms` }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                                                        <img
                                                            src={review.account.avatarUrl}
                                                            alt={review.account.fullName || 'User'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {review.account.fullName ||
                                                                'Unknown User'}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {formatDate(review.updatedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-yellow-400 font-bold text-sm">
                                                        {review.rating}/5 ⭐
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center py-6 text-sm">
                                        No reviews yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trailer Modal */}
                {isTrailerOpen && (
                    <div
                        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${showModal ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {/* Backdrop - làm mờ thay vì che */}
                        <div
                            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${showModal ? 'opacity-100' : 'opacity-0'}`}
                            onClick={() => closeModal()}
                        ></div>

                        {/* Modal Content - chỉ video */}
                        <div
                            className={`relative z-10 w-full max-w-3xl bg-black rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${showModal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                        >
                            {/* Video Container */}
                            <div className="relative bg-black">
                                {/* Close button overlay */}
                                <button
                                    onClick={() => closeModal()}
                                    className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/50 hover:bg-red-600/80 text-white transition-all duration-300 hover:scale-110"
                                >
                                    <X size={18} className="drop-shadow-lg" />
                                </button>

                                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                        src={convertYouTubeUrl(movie.trailer)}
                                        title={`${movie.name} Trailer`}
                                        className="absolute inset-0 w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
