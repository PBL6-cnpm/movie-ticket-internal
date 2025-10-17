import type { Movie } from '@/shared/api/movie-api'
import { getPaginatedMovies, searchMoviesByName } from '@/shared/api/movie-api'
import { getAllMyBranchRooms } from '@/shared/api/room-api'
import {
    createShowTime,
    deleteShowTime,
    getShowTimesByDate,
    updateShowTime
} from '@/shared/api/showtime-api'
import Button from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import Label from '@/shared/components/ui/label'
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
        <div className="relative" ref={dropdownRef}>
            <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-between h-9 px-3 text-left font-normal"
            >
                <span className={!selectedMovie ? 'text-muted-foreground' : ''}>
                    {selectedMovie ? selectedMovie.name : placeholder}
                </span>
                <span className="ml-2">▼</span>
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
                                <div className="p-3 text-center text-muted-foreground">
                                    No movies available
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
    // Helper function to get local date in YYYY-MM-DD format
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

    // Form data for edit
    const [editFormData, setEditFormData] = useState<UpdateShowTimeRequest>({
        movieId: '',
        roomId: '',
        timeStart: new Date(),
        showDate: new Date()
    })

    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})

    // Fetch initial data
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
                console.log('ShowTimes response:', response)
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

    // Format datetime for input field
    // Format time only for input field (HH:MM)
    const formatTimeForInput = (date: Date | string): string => {
        const d = new Date(date)
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
    }

    // Format date for display
    const formatDate = (date: Date | string): string => {
        return new Date(date).toLocaleDateString('vi-VN')
    }

    // Format time for display
    const formatTime = (date: Date | string): string => {
        return new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Validate create form
    const validateCreateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.movieId) {
            errors.movieId = 'Please select a movie'
        }

        if (!formData.roomId) {
            errors.roomId = 'Please select a room'
        }

        if (!formData.timeStart) {
            errors.timeStart = 'Please select start time'
        }

        if (!formData.showDate) {
            errors.showDate = 'Please select show date'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Validate edit form
    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!editFormData.movieId) {
            errors.movieId = 'Please select a movie'
        }

        if (!editFormData.roomId) {
            errors.roomId = 'Please select a room'
        }

        if (!editFormData.timeStart) {
            errors.timeStart = 'Please select start time'
        }

        if (!editFormData.showDate) {
            errors.showDate = 'Please select show date'
        }

        setEditFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle create show time
    const handleCreateShowTime = async () => {
        if (!validateCreateForm()) {
            return
        }

        try {
            setIsCreating(true)
            // Ensure showDate is set to selectedDate
            const dataToSubmit = {
                ...formData,
                showDate: new Date(selectedDate)
            }
            const response = await createShowTime(dataToSubmit)

            if (response.success) {
                showToast.success('Showtime created successfully!')
                setShowCreateForm(false)
                setFormData({
                    movieId: '',
                    roomId: '',
                    timeStart: new Date(),
                    showDate: new Date(selectedDate)
                })
                setFormErrors({})

                // Refresh show times list
                const showTimesResponse = await getShowTimesByDate(selectedDate)
                if (showTimesResponse.success && showTimesResponse.data) {
                    setShowTimes(showTimesResponse.data)
                }
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

    // Handle edit show time
    const handleEditShowTime = (showTime: ShowTime) => {
        setEditingShowTime(showTime)
        setEditFormData({
            movieId: showTime.movie.id,
            roomId: showTime.room.id,
            timeStart: new Date(showTime.timeStart),
            showDate: new Date(showTime.showDate)
        })
        setEditFormErrors({})
        // Close create form if it's open
        if (showCreateForm) setShowCreateForm(false)
    }

    // Handle update show time
    const handleUpdateShowTime = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateEditForm() || !editingShowTime) {
            return
        }

        try {
            setIsUpdating(true)
            const response = await updateShowTime(editingShowTime.id, editFormData)

            if (response.success) {
                showToast.success('Showtime updated successfully!')
                setEditingShowTime(null)
                setEditFormErrors({})

                // Refresh show times list
                const showTimesResponse = await getShowTimesByDate(selectedDate)
                if (showTimesResponse.success && showTimesResponse.data) {
                    setShowTimes(showTimesResponse.data)
                }
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

    // Handle delete show time
    const handleDeleteShowTime = async (id: string) => {
        if (!confirm('Are you sure you want to delete this showtime?')) {
            return
        }

        try {
            const response = await deleteShowTime(id)

            if (response.success) {
                showToast.success('Showtime deleted successfully!')

                // Refresh show times list
                const showTimesResponse = await getShowTimesByDate(selectedDate)
                if (showTimesResponse.success && showTimesResponse.data) {
                    setShowTimes(showTimesResponse.data)
                }
            } else {
                showToast.error(response.message || 'Error deleting showtime')
            }
        } catch (error) {
            console.error('Error deleting show time:', error)
            showToast.error('Error deleting showtime')
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">Loading...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-brand">Showtime Management</h1>
            </div>

            <div className="space-y-6">
                {/* Date Selection */}
                <div className="flex items-center gap-4">
                    <Label htmlFor="date">Select Date</Label>
                    <div className="flex items-center gap-2">
                        {/* Previous 2 days */}
                        {[-2, -1].map((offset) => {
                            const date = new Date(selectedDate)
                            date.setDate(date.getDate() + offset)
                            const dateStr = date.toISOString().split('T')[0]
                            return (
                                <Button
                                    key={offset}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDate(dateStr)}
                                    className="h-9 px-3 text-sm transition-all duration-200 hover:scale-105 hover:bg-brand/10 hover:border-brand/50"
                                >
                                    {date.getDate()}/{date.getMonth() + 1}
                                </Button>
                            )
                        })}

                        {/* Current date input */}
                        <Input
                            id="date"
                            type="date"
                            value={selectedDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setSelectedDate(e.target.value)
                            }
                            className="w-48 transition-all duration-200"
                        />

                        {/* Next 2 days */}
                        {[1, 2].map((offset) => {
                            const date = new Date(selectedDate)
                            date.setDate(date.getDate() + offset)
                            const dateStr = date.toISOString().split('T')[0]
                            return (
                                <Button
                                    key={offset}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDate(dateStr)}
                                    className="h-9 px-3 text-sm transition-all duration-200 hover:scale-105 hover:bg-brand/10 hover:border-brand/50"
                                >
                                    {date.getDate()}/{date.getMonth() + 1}
                                </Button>
                            )
                        })}

                        {/* Today button */}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedDate(getLocalDateString(new Date()))}
                            className="h-9 px-3 text-sm font-medium transition-all duration-200 hover:scale-105"
                        >
                            Today
                        </Button>
                    </div>
                </div>

                {/* Show Times List */}
                <Card className="border-0 shadow-none">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                Showtimes for {formatDate(selectedDate)} ({showTimes.length}{' '}
                                sessions)
                            </CardTitle>
                            <Button
                                onClick={() => {
                                    setShowCreateForm(!showCreateForm)
                                    // Reset editing state
                                    if (editingShowTime) setEditingShowTime(null)
                                }}
                                className="btn-primary hover:bg-[#e86d28]"
                                disabled={!selectedDate}
                            >
                                {showCreateForm ? 'Cancel' : 'Add Showtime'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent
                        className={`transition-all duration-300 ease-in-out ${
                            isTransitioning
                                ? 'opacity-0 translate-y-2'
                                : 'opacity-100 translate-y-0'
                        }`}
                    >
                        {showTimes.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No showtimes available for this date
                            </p>
                        ) : (
                            <div className="-my-1">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px]">No.</TableHead>
                                            <TableHead>Movie</TableHead>
                                            <TableHead className="text-center">Room</TableHead>
                                            <TableHead className="text-center">
                                                Start Time
                                            </TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Inline creation row */}
                                        {showCreateForm && (
                                            <TableRow className="bg-brand/10">
                                                <TableCell className="font-medium">New</TableCell>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <PaginatedMovieSelect
                                                            value={formData.movieId}
                                                            onValueChange={(value) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    movieId: value
                                                                })
                                                            }
                                                        />
                                                        {formErrors.movieId && (
                                                            <p className="text-sm text-destructive">
                                                                {formErrors.movieId}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="space-y-2">
                                                        <Select
                                                            value={formData.roomId}
                                                            onValueChange={(value) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    roomId: value
                                                                })
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
                                                            <p className="text-sm text-destructive">
                                                                {formErrors.roomId}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="space-y-2">
                                                        <Input
                                                            type="time"
                                                            value={formatTimeForInput(
                                                                formData.timeStart
                                                            )}
                                                            onChange={(e) => {
                                                                const [hours, minutes] =
                                                                    e.target.value.split(':')
                                                                const newDate = new Date(
                                                                    formData.timeStart
                                                                )
                                                                newDate.setHours(
                                                                    parseInt(hours),
                                                                    parseInt(minutes)
                                                                )
                                                                setFormData({
                                                                    ...formData,
                                                                    timeStart: newDate
                                                                })
                                                            }}
                                                            className="h-9"
                                                        />
                                                        {formErrors.timeStart && (
                                                            <p className="text-sm text-destructive">
                                                                {formErrors.timeStart}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleCreateShowTime}
                                                            disabled={isCreating}
                                                            className="h-9 w-9 p-0 text-brand border-brand hover:bg-brand hover:text-white"
                                                        >
                                                            ✓
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setShowCreateForm(false)
                                                                setFormData({
                                                                    movieId: '',
                                                                    roomId: '',
                                                                    showDate: new Date(),
                                                                    timeStart: new Date()
                                                                })
                                                                setFormErrors({})
                                                            }}
                                                            className="h-9 w-9 p-0"
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {showTimes
                                            .sort((a, b) => {
                                                // First, sort by movie name to group same movies together
                                                const movieComparison = a.movie.name.localeCompare(
                                                    b.movie.name
                                                )
                                                if (movieComparison !== 0) return movieComparison

                                                // Then sort by start time within the same movie
                                                return (
                                                    new Date(a.timeStart).getTime() -
                                                    new Date(b.timeStart).getTime()
                                                )
                                            })
                                            .map((showTime, index) => {
                                                const isEditing =
                                                    editingShowTime?.id === showTime.id

                                                return (
                                                    <TableRow
                                                        key={showTime.id}
                                                        className={isEditing ? 'bg-brand/10' : ''}
                                                    >
                                                        <TableCell className="font-medium">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={showTime.movie.poster}
                                                                    alt={showTime.movie.name}
                                                                    className="w-10 h-14 object-cover rounded shadow-sm"
                                                                />
                                                                <span className="font-medium">
                                                                    {showTime.movie.name}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {isEditing ? (
                                                                <div className="space-y-2">
                                                                    <Select
                                                                        value={editFormData.roomId}
                                                                        onValueChange={(value) =>
                                                                            setEditFormData({
                                                                                ...editFormData,
                                                                                roomId: value
                                                                            })
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
                                                                    {editFormErrors.roomId && (
                                                                        <p className="text-xs text-red-500">
                                                                            {editFormErrors.roomId}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                showTime.room?.name || 'N/A'
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-brand text-center">
                                                            {isEditing ? (
                                                                <div className="space-y-2">
                                                                    <Input
                                                                        type="time"
                                                                        value={formatTimeForInput(
                                                                            editFormData.timeStart ||
                                                                                new Date()
                                                                        )}
                                                                        onChange={(
                                                                            e: React.ChangeEvent<HTMLInputElement>
                                                                        ) => {
                                                                            // Parse time and combine with current date
                                                                            const [hours, minutes] =
                                                                                e.target.value.split(
                                                                                    ':'
                                                                                )
                                                                            const newDate =
                                                                                new Date(
                                                                                    editFormData.timeStart ||
                                                                                        new Date()
                                                                                )
                                                                            newDate.setHours(
                                                                                parseInt(hours)
                                                                            )
                                                                            newDate.setMinutes(
                                                                                parseInt(minutes)
                                                                            )
                                                                            setEditFormData({
                                                                                ...editFormData,
                                                                                timeStart: newDate
                                                                            })
                                                                        }}
                                                                        className="h-9"
                                                                    />
                                                                    {editFormErrors.timeStart && (
                                                                        <p className="text-xs text-red-500">
                                                                            {
                                                                                editFormErrors.timeStart
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                formatTime(showTime.timeStart)
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {isEditing ? (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.preventDefault()
                                                                            handleUpdateShowTime(e)
                                                                        }}
                                                                        disabled={isUpdating}
                                                                        className="h-8 w-8 p-0 bg-[#e86d28] hover:bg-[#d35f1a] text-white"
                                                                    >
                                                                        ✓
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            setEditingShowTime(null)
                                                                            setEditFormErrors({})
                                                                        }}
                                                                        disabled={isUpdating}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        ✕
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            handleEditShowTime(
                                                                                showTime
                                                                            )
                                                                        }
                                                                        className="h-8 px-3"
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            handleDeleteShowTime(
                                                                                showTime.id
                                                                            )
                                                                        }
                                                                        className="h-8 px-3"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ShowTimePage
