import type { Movie } from '@/features/super-admin/types/movie.types'
import { getPaginatedMovies, searchMoviesByName } from '@/shared/api/movie-api'
import { getAllMyBranchRooms } from '@/shared/api/room-api'
import {
    createShowTime,
    deleteShowTime,
    getShowTimesByDateAndRoom,
    updateShowTime
} from '@/shared/api/showtime-api'
import Button from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
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
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit2,
    Film,
    MapPin,
    MoreHorizontal,
    Trash2
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

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
    }, [isOpen, page, searchQuery])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const selectedMovie = movies.find((m) => m.id === value)
    const totalPages = Math.ceil(total / pageSize)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setPage(1)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {selectedMovie ? selectedMovie.name : placeholder}
                <ChevronRight
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-md border border-border bg-background/95 backdrop-blur-sm shadow-lg">
                    <div className="p-2 border-b border-border">
                        <Input
                            placeholder="Search movies..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="h-8"
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                Loading...
                            </div>
                        ) : movies.length === 0 ? (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                No movies found
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {movies.map((movie) => (
                                    <button
                                        key={movie.id}
                                        type="button"
                                        onClick={() => {
                                            onValueChange(movie.id)
                                            setIsOpen(false)
                                        }}
                                        className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-accent transition-colors flex items-center gap-2 ${
                                            value === movie.id ? 'bg-accent' : ''
                                        }`}
                                    >
                                        <img
                                            src={movie.poster}
                                            alt={movie.name}
                                            className="w-8 h-12 object-cover rounded"
                                        />
                                        <span className="flex-1 truncate">{movie.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-2 border-t border-border">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                                className="h-7 w-7 p-0"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                {page} / {totalPages}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isLoading}
                                className="h-7 w-7 p-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const ShowTimeRoomDetailPage = () => {
    const navigate = useNavigate()
    const params = useParams({ strict: false }) as { roomId?: string }
    const searchParams = useSearch({ strict: false })
    const date = (searchParams as { date?: string })?.date || new Date().toISOString().split('T')[0]
    const roomId = params.roomId

    const [showTimes, setShowTimes] = useState<ShowTime[]>([])
    const [loading, setLoading] = useState(true)
    const [roomName, setRoomName] = useState<string>('')
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Edit state
    const [editingShowTime, setEditingShowTime] = useState<ShowTime | null>(null)
    const [, setRooms] = useState<Room[]>([])
    const [isUpdating, setIsUpdating] = useState(false)
    const [editFormData, setEditFormData] = useState<UpdateShowTimeRequest>({
        movieId: '',
        roomId: '',
        timeStart: new Date(),
        showDate: new Date()
    })

    // Create state
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createFormData, setCreateFormData] = useState<CreateShowTimeRequest>({
        movieId: '',
        roomId: roomId || '',
        timeStart: new Date(),
        showDate: new Date(date)
    })
    const [formErrors, setFormErrors] = useState<{
        movieId?: string
        timeStart?: string
    }>({})

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    }

    const fetchShowTimes = useCallback(async () => {
        if (!roomId || !date) return

        try {
            setLoading(true)
            const response = await getShowTimesByDateAndRoom(date, roomId)
            if (response.success && response.data) {
                const sortedShowTimes = response.data.sort(
                    (a: ShowTime, b: ShowTime) =>
                        new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime()
                )
                setShowTimes(sortedShowTimes)

                // Get room info from first showtime
                if (sortedShowTimes.length > 0) {
                    setRoomName(sortedShowTimes[0].room?.name || 'Unknown Room')
                }
            }
        } catch (error) {
            console.error('Failed to fetch showtimes:', error)
            showToast.error('Failed to load showtime details')
        } finally {
            setLoading(false)
        }
    }, [roomId, date])

    useEffect(() => {
        fetchShowTimes()
    }, [fetchShowTimes])

    // Fetch rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await getAllMyBranchRooms()
                if (response.success && response.data) {
                    setRooms(response.data)
                    // Set room name if not yet set
                    if (!roomName && roomId) {
                        const room = response.data.find((r: Room) => r.id === roomId)
                        if (room) setRoomName(room.name)
                    }
                }
            } catch (error) {
                console.error('Error fetching rooms:', error)
            }
        }
        fetchRooms()
    }, [roomId, roomName])

    // Update createFormData when roomId or date changes
    useEffect(() => {
        setCreateFormData({
            movieId: '',
            roomId: roomId || '',
            timeStart: new Date(),
            showDate: new Date(date)
        })
    }, [roomId, date])

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

    const toggleDropdown = (showTimeId: string) => {
        setActiveDropdown(activeDropdown === showTimeId ? null : showTimeId)
    }

    const handleDeleteShowTime = async (id: string) => {
        if (!confirm('Are you sure you want to delete this showtime?')) {
            return
        }

        try {
            const response = await deleteShowTime(id)

            if (response.success) {
                showToast.success('Showtime deleted successfully!')
                setActiveDropdown(null)
                fetchShowTimes()
            } else {
                showToast.error(response.message || 'Error deleting showtime')
            }
        } catch (error) {
            console.error('Error deleting show time:', error)
            showToast.error('Error deleting showtime')
        }
    }

    const handleEditShowTime = (showTimeId: string) => {
        const showTime = showTimes.find((st) => st.id === showTimeId)
        if (showTime) {
            setEditingShowTime(showTime)
            setEditFormData({
                movieId: showTime.movie.id,
                roomId: showTime.room.id,
                timeStart: new Date(showTime.timeStart),
                showDate: new Date(showTime.showDate)
            })
        }
        setActiveDropdown(null)
    }

    const handleCancelEdit = () => {
        setEditingShowTime(null)
        setEditFormData({
            movieId: '',
            roomId: '',
            timeStart: new Date(),
            showDate: new Date()
        })
    }

    const handleUpdateShowTime = async () => {
        if (!editingShowTime) return

        try {
            setIsUpdating(true)
            const response = await updateShowTime(editingShowTime.id, editFormData)

            if (response.success) {
                showToast.success('Showtime updated successfully!')
                handleCancelEdit()
                fetchShowTimes()
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

    const formatTimeForInput = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const handleCreateShowTime = async () => {
        // Validate form
        const errors: { movieId?: string; timeStart?: string } = {}
        if (!createFormData.movieId) {
            errors.movieId = 'Movie is required'
        }
        if (!createFormData.timeStart) {
            errors.timeStart = 'Time is required'
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        try {
            setIsCreating(true)
            const response = await createShowTime(createFormData)

            if (response.success) {
                showToast.success('Showtime created successfully!')
                setShowCreateForm(false)
                setCreateFormData({
                    movieId: '',
                    roomId: roomId || '',
                    timeStart: new Date(),
                    showDate: new Date(date)
                })
                setFormErrors({})
                fetchShowTimes()
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

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/admin/show-times' })}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Showtimes
                </Button>
            </div>

            {/* Room Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-brand" />
                        Room Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold">{roomName || 'Loading...'}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                                {showTimes.length} showtime{showTimes.length !== 1 ? 's' : ''}{' '}
                                scheduled
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Showtimes Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Screening Schedule</CardTitle>
                        <Button
                            onClick={() => {
                                setShowCreateForm(!showCreateForm)
                                if (editingShowTime) setEditingShowTime(null)
                            }}
                            className="btn-primary hover:bg-[#e86d28]"
                        >
                            {showCreateForm ? 'Cancel' : 'Add Showtime'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading showtimes...
                        </div>
                    ) : showTimes.length === 0 && !showCreateForm ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No showtimes scheduled for this room on the selected date
                        </div>
                    ) : (
                        <div style={{ overflow: 'visible' }} className="[&>div]:overflow-visible">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">No.</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <Film className="w-4 h-4" />
                                                Movie
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Start Time
                                            </div>
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
                                                        value={createFormData.movieId}
                                                        onValueChange={(value) =>
                                                            setCreateFormData({
                                                                ...createFormData,
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
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="time"
                                                        value={formatTimeForInput(
                                                            createFormData.timeStart
                                                        )}
                                                        onChange={(e) => {
                                                            const [hours, minutes] =
                                                                e.target.value.split(':')
                                                            const newDate = new Date(
                                                                createFormData.timeStart
                                                            )
                                                            newDate.setHours(
                                                                parseInt(hours),
                                                                parseInt(minutes)
                                                            )
                                                            setCreateFormData({
                                                                ...createFormData,
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
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={handleCreateShowTime}
                                                        disabled={isCreating}
                                                        className="h-8 w-8 p-0 bg-[#e86d28] hover:bg-[#d35f1a] text-white"
                                                    >
                                                        {isCreating ? '...' : '✓'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShowCreateForm(false)
                                                            setCreateFormData({
                                                                movieId: '',
                                                                roomId: roomId || '',
                                                                timeStart: new Date(),
                                                                showDate: new Date(date)
                                                            })
                                                            setFormErrors({})
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        ✕
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {showTimes.map((showTime, index) => {
                                        const isEditing = editingShowTime?.id === showTime.id

                                        return (
                                            <TableRow
                                                key={showTime.id}
                                                className={isEditing ? 'bg-brand/10' : ''}
                                            >
                                                <TableCell className="font-medium">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <PaginatedMovieSelect
                                                            value={editFormData.movieId || ''}
                                                            onValueChange={(value) =>
                                                                setEditFormData({
                                                                    ...editFormData,
                                                                    movieId: value
                                                                })
                                                            }
                                                        />
                                                    ) : (
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
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <Input
                                                            type="time"
                                                            value={formatTimeForInput(
                                                                editFormData.timeStart || new Date()
                                                            )}
                                                            onChange={(e) => {
                                                                const [hours, minutes] =
                                                                    e.target.value.split(':')
                                                                const newDate = new Date(
                                                                    editFormData.timeStart ||
                                                                        new Date()
                                                                )
                                                                newDate.setHours(parseInt(hours))
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
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-brand">
                                                                {formatTime(showTime.timeStart)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={handleUpdateShowTime}
                                                                disabled={isUpdating}
                                                                className="h-8 w-8 p-0 bg-[#e86d28] hover:bg-[#d35f1a] text-white"
                                                            >
                                                                ✓
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleCancelEdit}
                                                                disabled={isUpdating}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center">
                                                            <div className="relative dropdown-container">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        toggleDropdown(showTime.id)
                                                                    }
                                                                    className="border border-surface text-secondary hover:bg-brand hover:text-primary h-8 w-8 p-0 transition-colors"
                                                                >
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>

                                                                {activeDropdown === showTime.id && (
                                                                    <div
                                                                        ref={dropdownRef}
                                                                        className="absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1"
                                                                    >
                                                                        <div className="absolute -top-2 right-2 w-4 h-4 bg-gray-800 border-t border-l border-gray-700 transform rotate-45 z-[-1]"></div>

                                                                        <button
                                                                            onClick={() =>
                                                                                handleEditShowTime(
                                                                                    showTime.id
                                                                                )
                                                                            }
                                                                            className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-blue-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                        >
                                                                            <Edit2 className="w-4 h-4 text-blue-400" />
                                                                            Edit
                                                                        </button>
                                                                        <div className="border-t border-surface my-1" />
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteShowTime(
                                                                                    showTime.id
                                                                                )
                                                                            }
                                                                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
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
    )
}

export default ShowTimeRoomDetailPage
