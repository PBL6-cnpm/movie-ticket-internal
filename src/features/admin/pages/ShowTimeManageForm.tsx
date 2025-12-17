import type { Movie } from '@/features/super-admin/types/movie.types'
import { getPaginatedMovies, searchMoviesByName } from '@/shared/api/movie-api'
import { getAllMyBranchRooms } from '@/shared/api/room-api'
import { createShowTime, getShowTimesByDate, updateShowTime } from '@/shared/api/showtime-api'
import Button from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/shared/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/components/ui/table'
import type {
    CreateShowTimeRequest,
    Room,
    ShowTime,
    UpdateShowTimeRequest
} from '@/shared/types/showtime.types'
import { showToast } from '@/shared/utils/toast'
import { useLocation, useNavigate } from '@tanstack/react-router'
import {
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    Film,
    Layers,
    Plus,
    X,
    Check,
    ChevronDown
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Paginated Movie Select Component
const PaginatedMovieSelect = ({
    value,
    onValueChange,
    placeholder = 'Select a movie from the list',
    disabled = false
}: {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
}) => {
    const [movies, setMovies] = useState<Movie[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [page, setPage] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const pageSize = 8

    const fetchMovies = async (pageNum: number, search: string = '') => {
        try {
            setIsLoading(true)
            const offset = (pageNum - 1) * pageSize

            let response
            // Use search API if search query exists, otherwise use regular pagination
            if (search && search.trim()) {
                response = await searchMoviesByName({
                    name: search.trim(),
                    limit: pageSize,
                    offset
                })
            } else {
                response = await getPaginatedMovies({
                    limit: pageSize,
                    offset
                })
            }

            if (response.success && response.data) {
                setMovies(response.data.items || [])
                setTotal(response.data.meta?.total || 0)
                console.log('Movies loaded:', {
                    items: response.data.items?.length || 0,
                    total: response.data.meta?.total || 0,
                    totalPages: response.data.meta?.total
                        ? Math.ceil(response.data.meta.total / pageSize)
                        : 0,
                    currentPage: pageNum,
                    searchQuery: search
                })
            }
        } catch (error) {
            console.error('Error fetching movies:', error)
            setMovies([])
            setTotal(0)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchMovies(page, searchQuery)
        }
    }, [page, searchQuery, isOpen])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleSearch = () => {
        setPage(1)
        fetchMovies(1, searchQuery)
    }

    const totalPages = Math.ceil(total / pageSize)
    const selectedMovie = movies?.find((m) => m.id === value)

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-between h-9 px-3 text-left font-normal"
            >
                <span className={`truncate ${!selectedMovie ? 'text-muted-foreground' : ''}`}>
                    {selectedMovie ? selectedMovie.name : placeholder}
                </span>
                <ChevronDown className="w-4 h-4 ml-2 shrink-0" />
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop overlay */}
                    <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />

                    {/* Dropdown content */}
                    <div className="absolute z-[100] w-full mt-1 bg-background/95 backdrop-blur-sm border border-border rounded-md shadow-xl max-h-96 overflow-hidden flex flex-col">
                        {/* Search Header */}
                        <div className="p-3 border-b bg-muted/80 shrink-0">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Search movie..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch()
                                        }
                                    }}
                                    className="flex-1 h-8"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    className="btn-primary h-8 px-3"
                                >
                                    {isLoading ? 'Searching...' : 'Search'}
                                </Button>
                            </div>

                            {/* Pagination Info */}
                            <div className="mt-2 text-xs text-muted-foreground">
                                {total > 0 ? (
                                    <>
                                        Page {page}/{totalPages} ({total} movies)
                                    </>
                                ) : (
                                    <>No movies found</>
                                )}
                            </div>
                        </div>

                        {/* Movie List */}
                        <div className="max-h-48 overflow-y-auto flex-1 bg-background">
                            {isLoading ? (
                                <div className="p-3 text-center text-muted-foreground">
                                    Loading...
                                </div>
                            ) : movies && movies.length > 0 ? (
                                movies.map((movie) => (
                                    <button
                                        key={movie.id}
                                        type="button"
                                        className={`w-full px-3 py-2 text-left hover:bg-accent focus:bg-accent border-0 transition-colors ${
                                            movie.id === value ? 'bg-accent' : 'bg-background'
                                        }`}
                                        onClick={() => {
                                            onValueChange(movie.id)
                                            setIsOpen(false)
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={movie.poster}
                                                alt={movie.name}
                                                className="w-8 h-12 object-cover rounded"
                                            />
                                            <span className="flex-1 truncate">{movie.name}</span>
                                            {movie.id === value && (
                                                <span className="text-primary">✓</span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-muted-foreground">
                                    No movies found
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer - Always show when movies are loaded */}
                        {!isLoading && movies && movies.length > 0 && (
                            <div className="p-2 border-t bg-muted shrink-0">
                                <div className="flex items-center justify-between gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={page <= 1 || isLoading}
                                        onClick={() => setPage((prev) => prev - 1)}
                                        className="h-7 px-2 text-xs shrink-0"
                                        title="Previous page"
                                    >
                                        ◀
                                    </Button>

                                    <div className="flex gap-1 items-center flex-wrap justify-center">
                                        {totalPages <= 5 ? (
                                            // Show all pages if 5 or less
                                            Array.from({ length: totalPages }, (_, i) => {
                                                const pageNum = i + 1
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        size="sm"
                                                        variant={
                                                            page === pageNum ? 'default' : 'outline'
                                                        }
                                                        disabled={isLoading}
                                                        onClick={() => setPage(pageNum)}
                                                        className="h-7 w-7 p-0 text-xs"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                )
                                            })
                                        ) : (
                                            // Show smart pagination for more than 5 pages
                                            <>
                                                {page > 2 && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isLoading}
                                                            onClick={() => setPage(1)}
                                                            className="h-7 w-7 p-0 text-xs"
                                                        >
                                                            1
                                                        </Button>
                                                        {page > 3 && (
                                                            <span className="text-xs px-1">
                                                                ...
                                                            </span>
                                                        )}
                                                    </>
                                                )}

                                                {Array.from({ length: 3 }, (_, i) => {
                                                    let pageNum
                                                    if (page === 1) {
                                                        pageNum = i + 1
                                                    } else if (page === totalPages) {
                                                        pageNum = totalPages - 2 + i
                                                    } else {
                                                        pageNum = page - 1 + i
                                                    }

                                                    if (pageNum < 1 || pageNum > totalPages)
                                                        return null

                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            size="sm"
                                                            variant={
                                                                page === pageNum
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            disabled={isLoading}
                                                            onClick={() => setPage(pageNum)}
                                                            className="h-7 w-7 p-0 text-xs"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    )
                                                })}

                                                {page < totalPages - 1 && (
                                                    <>
                                                        {page < totalPages - 2 && (
                                                            <span className="text-xs px-1">
                                                                ...
                                                            </span>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isLoading}
                                                            onClick={() => setPage(totalPages)}
                                                            className="h-7 w-7 p-0 text-xs"
                                                        >
                                                            {totalPages}
                                                        </Button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={page >= totalPages || isLoading}
                                        onClick={() => setPage((prev) => prev + 1)}
                                        className="h-7 px-2 text-xs shrink-0"
                                        title="Next page"
                                    >
                                        ▶
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

const ShowTimePage = () => {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine base path (admin or super-admin)
    const basePath = location.pathname.includes('super-admin') ? '/super-admin' : '/admin'

    const getLocalDateString = (date?: Date) => {
        const d = date || new Date()
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const [showTimes, setShowTimes] = useState<ShowTime[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString())
    const [loading, setLoading] = useState<boolean>(true)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
    const [editingShowTime, setEditingShowTime] = useState<ShowTime | null>(null)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false)

    // Form data for create
    const [formData, setFormData] = useState<CreateShowTimeRequest>({
        movieId: '',
        roomId: '',
        timeStart: new Date(),
        showDate: new Date()
    })

    const [editFormData, setEditFormData] = useState<UpdateShowTimeRequest>({
        movieId: '',
        roomId: '',
        timeStart: new Date(),
        showDate: new Date()
    })

    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})
    const [groupBy, setGroupBy] = useState<'movie' | 'room'>(() => {
        // Load from localStorage on initial render
        const saved = localStorage.getItem('showtimeGroupBy')
        return (saved === 'room' ? 'room' : 'movie') as 'movie' | 'room'
    })

    useEffect(() => {
        localStorage.setItem('showtimeGroupBy', groupBy)
    }, [groupBy])

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true)
                const roomsResponse = await getAllMyBranchRooms()

                if (roomsResponse.success && roomsResponse.data) {
                    setRooms(roomsResponse.data)
                }
            } catch (error) {
                console.error('Error fetching initial data:', error)
                showToast.error('Error loading data')
            } finally {
                setLoading(false)
            }
        }
        fetchInitialData()
    }, [])

    // Fetch show times when date changes
    useEffect(() => {
        const fetchShowTimes = async () => {
            try {
                // Trigger fade out animation
                setIsTransitioning(true)
                const response = await getShowTimesByDate(selectedDate)
                if (response.success && response.data) {
                    console.log('ShowTimes data:', response.data)
                    setShowTimes(response.data)
                }

                // Trigger fade in animation after a short delay
                setTimeout(() => {
                    setIsTransitioning(false)
                }, 100)
            } catch (error) {
                console.error('Error fetching show times:', error)
                showToast.error('Error loading showtimes')
                setIsTransitioning(false)
            }
        }

        if (selectedDate) {
            fetchShowTimes()
        }
    }, [selectedDate])

    // Update formData.showDate when selectedDate changes
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            showDate: new Date(selectedDate)
        }))
    }, [selectedDate])

    // Formatters
    const formatTimeForInput = (date: Date | string | undefined): string => {
        if (!date) return ''
        const d = new Date(date)
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }

    const formatDate = (date: Date | string): string => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const formatTime = (date: Date | string): string => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const updateDateWithTime = (
        timeString: string,
        currentDate: Date | string | undefined
    ): Date => {
        const date = currentDate ? new Date(currentDate) : new Date()
        const [hours, minutes] = timeString.split(':')
        if (hours && minutes) {
            date.setHours(parseInt(hours, 10))
            date.setMinutes(parseInt(minutes, 10))
            date.setSeconds(0)
        }
        return date
    }

    // Validation
    const validateCreateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.movieId) errors.movieId = 'Select a movie'
        if (!formData.roomId) errors.roomId = 'Select a room'
        if (!formData.timeStart) errors.timeStart = 'Invalid time'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!editFormData.roomId) errors.roomId = 'Select a room'
        if (!editFormData.timeStart) errors.timeStart = 'Invalid time'
        setEditFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handlers
    const handleCreateShowTime = async () => {
        if (!validateCreateForm()) {
            return
        }

        try {
            setIsCreating(true)
            const dataToSubmit = { ...formData, showDate: new Date(selectedDate) }
            const response = await createShowTime(dataToSubmit)

            if (response.success) {
                showToast.success('Showtime created!')
                setShowCreateForm(false)
                setFormData({
                    movieId: '',
                    roomId: '',
                    timeStart: new Date(),
                    showDate: new Date(selectedDate)
                })
                setFormErrors({})
                const res = await getShowTimesByDate(selectedDate)
                if (res.success && res.data) setShowTimes(res.data)
            } else {
                showToast.error(response.message || 'Error creating showtime')
            }
        } catch (error) {
            console.error('Error creating show time:', error)
            showToast.error('Error creating showtime')
        } finally {
            setIsCreating(false)
        }
    }

    const handleUpdateShowTime = async () => {
        if (!validateEditForm() || !editingShowTime) return
        try {
            setIsUpdating(true)
            const response = await updateShowTime(editingShowTime.id, editFormData)
            if (response.success) {
                showToast.success('Showtime updated!')
                setEditingShowTime(null)
                setEditFormErrors({})
                const res = await getShowTimesByDate(selectedDate)
                if (res.success && res.data) setShowTimes(res.data)
            } else {
                showToast.error(response.message || 'Error updating showtime')
            }
        } catch (error) {
            console.error('Error updating show time:', error)
            showToast.error('Error updating showtime')
        } finally {
            setIsUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                Loading resources...
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6 font-sans">
            {/* --- Page Header --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Showtime Schedule
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage cinema screenings and room allocations.
                    </p>
                </div>
            </div>

            {/* --- Control Toolbar --- */}
            <div className="bg-card border rounded-xl shadow-sm p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                {/* Date Picker Section - Adjusted Order: Prev | Input | Next | Today */}
                <div className="flex items-center p-1 bg-background border rounded-lg shadow-sm">
                    {/* Prev Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const d = new Date(selectedDate)
                            d.setDate(d.getDate() - 1)
                            setSelectedDate(d.toISOString().split('T')[0])
                        }}
                        className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-md"
                        title="Previous Day"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="relative mx-1">
                        <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-9 w-[140px] h-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-center font-medium cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const d = new Date(selectedDate)
                            d.setDate(d.getDate() + 1)
                            setSelectedDate(d.toISOString().split('T')[0])
                        }}
                        className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-md"
                        title="Next Day"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-5 bg-border mx-2" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDate(getLocalDateString(new Date()))}
                        className="h-9 px-3 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary rounded-md"
                    >
                        Today
                    </Button>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/40">
                        <Button
                            variant={groupBy === 'movie' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setGroupBy('movie')}
                            className={`h-8 text-xs gap-1.5 px-3 ${groupBy === 'movie' ? 'shadow-sm' : 'text-muted-foreground'}`}
                        >
                            <Film className="w-3.5 h-3.5" /> Movie
                        </Button>
                        <Button
                            variant={groupBy === 'room' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setGroupBy('room')}
                            className={`h-8 text-xs gap-1.5 px-3 ${groupBy === 'room' ? 'shadow-sm' : 'text-muted-foreground'}`}
                        >
                            <Layers className="w-3.5 h-3.5" /> Room
                        </Button>
                    </div>

                    <Button
                        onClick={() => {
                            setShowCreateForm(!showCreateForm)
                            if (editingShowTime) setEditingShowTime(null)
                        }}
                        size="sm"
                        className={`h-9 gap-2 transition-all ${
                            showCreateForm
                                ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20'
                                : 'bg-primary hover:bg-primary/90'
                        }`}
                        disabled={!selectedDate}
                    >
                        {showCreateForm ? (
                            <>
                                <X className="w-4 h-4" /> Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" /> Add Showtime
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* --- Main Content Table --- */}
            <Card className="border-border/60 shadow-sm overflow-hidden">
                <div className="px-6 py-3 border-b bg-muted/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Schedule for
                        </span>
                        <span className="font-bold text-base text-foreground capitalize">
                            {formatDate(selectedDate)}
                        </span>
                    </div>
                    <div className="text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                        {showTimes.length} Sessions
                    </div>
                </div>

                <CardContent
                    className={`p-0 transition-opacity duration-200 ${isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                >
                    {showTimes.length === 0 && !showCreateForm ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <Clock className="w-6 h-6 opacity-40" />
                            </div>
                            <p className="text-sm">No showtimes found for this date.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center uppercase">
                                        No.
                                    </TableHead>
                                    <TableHead className="w-[30%] uppercase">
                                        {groupBy === 'movie' ? 'Movie Info' : 'Room Info'}
                                    </TableHead>
                                    <TableHead className="uppercase">Sessions</TableHead>
                                    <TableHead className="w-[100px] text-center uppercase">
                                        View
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Create Form Row */}
                                {showCreateForm && (
                                    <TableRow className="bg-primary/5 border-b-2 border-primary/20 animate-in fade-in zoom-in-95 duration-200">
                                        <TableCell className="text-center font-bold text-primary text-xs">
                                            NEW
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5">
                                                <PaginatedMovieSelect
                                                    value={formData.movieId}
                                                    onValueChange={(v) =>
                                                        setFormData({ ...formData, movieId: v })
                                                    }
                                                />
                                                {formErrors.movieId && (
                                                    <p className="text-[10px] text-destructive font-medium">
                                                        {formErrors.movieId}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col sm:flex-row gap-3 items-start">
                                                <div className="flex-1 w-full space-y-1.5">
                                                    <Select
                                                        value={formData.roomId}
                                                        onValueChange={(v) =>
                                                            setFormData({ ...formData, roomId: v })
                                                        }
                                                    >
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Select room" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-background/95 backdrop-blur-sm border-border">
                                                            {rooms.map((room) => (
                                                                <SelectItem
                                                                    key={room.id}
                                                                    value={room.id}
                                                                    className="bg-background hover:bg-accent focus:bg-accent"
                                                                >
                                                                    {room.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {formErrors.roomId && (
                                                        <p className="text-[10px] text-destructive font-medium">
                                                            {formErrors.roomId}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="w-full sm:w-32 space-y-1.5">
                                                    <Input
                                                        type="time"
                                                        className="h-9 bg-background text-sm"
                                                        value={formatTimeForInput(
                                                            formData.timeStart
                                                        )}
                                                        // Sử dụng helper function mới ở đây
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                timeStart: updateDateWithTime(
                                                                    e.target.value,
                                                                    prev.timeStart
                                                                )
                                                            }))
                                                        }
                                                    />
                                                    {formErrors.timeStart && (
                                                        <p className="text-[10px] text-destructive font-medium">
                                                            {formErrors.timeStart}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <Button
                                                    size="sm"
                                                    onClick={handleCreateShowTime}
                                                    disabled={isCreating}
                                                    className="h-8 text-xs font-semibold px-4"
                                                >
                                                    {isCreating
                                                        ? 'Creating...'
                                                        : 'Confirm Creation'}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {/* --- Listing Rows --- */}
                                {(() => {
                                    if (groupBy === 'movie') {
                                        const grouped = showTimes.reduce(
                                            (acc, curr) => {
                                                const id = curr.movie.id
                                                if (!acc[id])
                                                    acc[id] = {
                                                        entity: curr.movie as Movie,
                                                        items: []
                                                    }
                                                acc[id].items.push(curr)
                                                return acc
                                            },
                                            {} as Record<
                                                string,
                                                { entity: Movie; items: ShowTime[] }
                                            >
                                        )

                                        return Object.values(grouped)
                                            .sort((a, b) =>
                                                a.entity.name.localeCompare(b.entity.name)
                                            )
                                            .map((group, idx) => {
                                                const sortedItems = group.items.sort(
                                                    (a, b) =>
                                                        new Date(a.timeStart).getTime() -
                                                        new Date(b.timeStart).getTime()
                                                )
                                                const isEditingGroup = sortedItems.some(
                                                    (st) => editingShowTime?.id === st.id
                                                )

                                                return (
                                                    <TableRow
                                                        key={group.entity.id}
                                                        className={`group hover:bg-muted/20 transition-colors ${isEditingGroup ? 'bg-muted/10' : ''}`}
                                                    >
                                                        <TableCell className="text-center font-medium text-muted-foreground text-xs">
                                                            {idx + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-3 items-start py-1">
                                                                <div className="relative w-10 h-14 rounded overflow-hidden shadow-sm shrink-0 bg-muted border border-border">
                                                                    <img
                                                                        src={group.entity.poster}
                                                                        alt=""
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col justify-center min-h-[56px]">
                                                                    <span className="font-semibold text-sm leading-tight line-clamp-2">
                                                                        {group.entity.name}
                                                                    </span>
                                                                    <span className="text-[11px] text-muted-foreground mt-1 bg-muted w-fit px-1.5 rounded">
                                                                        {group.items.length}{' '}
                                                                        sessions
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-2 py-2">
                                                                {sortedItems.map((st) => {
                                                                    const isEditing =
                                                                        editingShowTime?.id ===
                                                                        st.id
                                                                    if (isEditing) {
                                                                        return (
                                                                            <div
                                                                                key={st.id}
                                                                                className="flex flex-col gap-1 p-2 rounded border border-primary/30 bg-background shadow-sm animate-in zoom-in-95"
                                                                            >
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Select
                                                                                        value={
                                                                                            editFormData.roomId
                                                                                        }
                                                                                        onValueChange={(
                                                                                            v
                                                                                        ) =>
                                                                                            setEditFormData(
                                                                                                {
                                                                                                    ...editFormData,
                                                                                                    roomId: v
                                                                                                }
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger className="h-7 w-[110px] text-xs">
                                                                                            <SelectValue />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            {rooms.map(
                                                                                                (
                                                                                                    r
                                                                                                ) => (
                                                                                                    <SelectItem
                                                                                                        key={
                                                                                                            r.id
                                                                                                        }
                                                                                                        value={
                                                                                                            r.id
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            r.name
                                                                                                        }
                                                                                                    </SelectItem>
                                                                                                )
                                                                                            )}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                    <span className="text-muted-foreground text-[10px]">
                                                                                        -
                                                                                    </span>
                                                                                    <Input
                                                                                        type="time"
                                                                                        className="h-7 w-[80px] text-xs px-1"
                                                                                        value={formatTimeForInput(
                                                                                            editFormData.timeStart
                                                                                        )}
                                                                                        // Sử dụng helper function mới ở đây
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            setEditFormData(
                                                                                                (
                                                                                                    prev
                                                                                                ) => ({
                                                                                                    ...prev,
                                                                                                    timeStart:
                                                                                                        updateDateWithTime(
                                                                                                            e
                                                                                                                .target
                                                                                                                .value,
                                                                                                            prev.timeStart
                                                                                                        )
                                                                                                })
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    <div className="flex gap-1 ml-1">
                                                                                        <Button
                                                                                            size="icon"
                                                                                            className="h-7 w-7 bg-green-600 hover:bg-green-700 text-white"
                                                                                            onClick={
                                                                                                handleUpdateShowTime
                                                                                            }
                                                                                            disabled={
                                                                                                isUpdating
                                                                                            }
                                                                                        >
                                                                                            <Check className="w-3.5 h-3.5" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="icon"
                                                                                            variant="ghost"
                                                                                            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                                                                                            onClick={() => {
                                                                                                setEditingShowTime(
                                                                                                    null
                                                                                                )
                                                                                                setEditFormErrors(
                                                                                                    {}
                                                                                                )
                                                                                            }}
                                                                                        >
                                                                                            <X className="w-3.5 h-3.5" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                                {/* FIX 2: Hiển thị lỗi editFormErrors */}
                                                                                {(editFormErrors.roomId ||
                                                                                    editFormErrors.timeStart) && (
                                                                                    <div className="flex flex-col px-1">
                                                                                        {editFormErrors.roomId && (
                                                                                            <span className="text-[10px] text-destructive">
                                                                                                {
                                                                                                    editFormErrors.roomId
                                                                                                }
                                                                                            </span>
                                                                                        )}
                                                                                        {editFormErrors.timeStart && (
                                                                                            <span className="text-[10px] text-destructive">
                                                                                                {
                                                                                                    editFormErrors.timeStart
                                                                                                }
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    }
                                                                    return (
                                                                        <div
                                                                            key={st.id}
                                                                            onClick={() => {
                                                                                setEditingShowTime(
                                                                                    st
                                                                                )
                                                                                setEditFormData({
                                                                                    movieId:
                                                                                        st.movie.id,
                                                                                    roomId: st.room
                                                                                        ?.id,
                                                                                    timeStart:
                                                                                        new Date(
                                                                                            st.timeStart
                                                                                        ),
                                                                                    showDate:
                                                                                        new Date(
                                                                                            st.showDate
                                                                                        )
                                                                                })
                                                                            }}
                                                                            className="group/chip cursor-pointer relative flex flex-col items-center justify-center min-w-[72px] px-2 py-1 rounded border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all select-none"
                                                                        >
                                                                            <span className="font-bold text-sm tracking-tight text-foreground/90 group-hover/chip:text-primary">
                                                                                {formatTime(
                                                                                    st.timeStart
                                                                                )}
                                                                            </span>
                                                                            <span className="text-[10px] text-muted-foreground truncate max-w-[80px] group-hover/chip:text-foreground/70">
                                                                                {st.room?.name ||
                                                                                    'N/A'}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center align-middle">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    navigate({
                                                                        to: `${basePath}/show-times/${group.entity.id}?date=${selectedDate}`
                                                                    })
                                                                }
                                                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                                                            >
                                                                <Eye className="w-6 h-6" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                    } else {
                                        // Group by Room logic
                                        const grouped = showTimes.reduce(
                                            (acc, curr) => {
                                                const id = curr.room?.id || 'unknown'
                                                if (!acc[id])
                                                    acc[id] = { entity: curr.room, items: [] }
                                                acc[id].items.push(curr)
                                                return acc
                                            },
                                            {} as Record<
                                                string,
                                                { entity: Room; items: ShowTime[] }
                                            >
                                        )

                                        return Object.values(grouped)
                                            .sort((a, b) =>
                                                (a.entity?.name || '').localeCompare(
                                                    b.entity?.name || ''
                                                )
                                            )
                                            .map((group, idx) => {
                                                const sortedItems = group.items.sort(
                                                    (a, b) =>
                                                        new Date(a.timeStart).getTime() -
                                                        new Date(b.timeStart).getTime()
                                                )

                                                return (
                                                    <TableRow
                                                        key={group.entity?.id || idx}
                                                        className="hover:bg-muted/20 transition-colors"
                                                    >
                                                        <TableCell className="text-center font-medium text-muted-foreground text-xs">
                                                            {idx + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3 py-1">
                                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm text-sm border border-primary/10">
                                                                    {group.entity?.name?.substring(
                                                                        0,
                                                                        1
                                                                    ) || '?'}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-sm">
                                                                        {group.entity?.name ||
                                                                            'Unknown Room'}
                                                                    </div>
                                                                    <div className="text-[11px] text-muted-foreground">
                                                                        {group.items.length} movies
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-2 py-2">
                                                                {sortedItems.map((st) => {
                                                                    const isEditing =
                                                                        editingShowTime?.id ===
                                                                        st.id
                                                                    if (isEditing) {
                                                                        return (
                                                                            <div
                                                                                key={st.id}
                                                                                className="flex items-center gap-2 px-2 py-1 bg-warning/10 text-warning-foreground text-xs rounded border border-warning/20"
                                                                            >
                                                                                <span>
                                                                                    Editing in Movie
                                                                                    Mode recommended
                                                                                </span>
                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="ghost"
                                                                                    className="h-4 w-4"
                                                                                    onClick={() =>
                                                                                        setEditingShowTime(
                                                                                            null
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <X className="w-3 h-3" />
                                                                                </Button>
                                                                            </div>
                                                                        )
                                                                    }
                                                                    return (
                                                                        <div
                                                                            key={st.id}
                                                                            onClick={() => {
                                                                                setEditingShowTime(
                                                                                    st
                                                                                )
                                                                                setEditFormData({
                                                                                    movieId:
                                                                                        st.movie.id,
                                                                                    roomId: st.room
                                                                                        ?.id,
                                                                                    timeStart:
                                                                                        new Date(
                                                                                            st.timeStart
                                                                                        ),
                                                                                    showDate:
                                                                                        new Date(
                                                                                            st.showDate
                                                                                        )
                                                                                })
                                                                                setGroupBy('movie')
                                                                                showToast.info(
                                                                                    'Switched to Movie view for editing'
                                                                                )
                                                                            }}
                                                                            className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 rounded border bg-card hover:bg-accent hover:border-accent-foreground/30 transition-all group/item shadow-sm"
                                                                        >
                                                                            <span className="font-bold text-xs text-foreground/90">
                                                                                {formatTime(
                                                                                    st.timeStart
                                                                                )}
                                                                            </span>
                                                                            <div className="w-px h-3 bg-border" />
                                                                            <span className="text-[11px] text-muted-foreground group-hover/item:text-foreground truncate max-w-[120px]">
                                                                                {st.movie.name}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    if (group.entity?.id)
                                                                        navigate({
                                                                            to: `${basePath}/show-times/room/${group.entity.id}?date=${selectedDate}`
                                                                        })
                                                                }}
                                                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                                                            >
                                                                <Eye className="w-6 h-6" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                    }
                                })()}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowTimePage
