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
import { Card, CardContent } from '@/shared/components/ui/card'
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
import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
    ArrowLeft,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    MapPin,
    Plus,
    Trash2,
    X
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// --- Component PaginatedMovieSelect (Giữ nguyên) ---
const PaginatedMovieSelect = ({
    value,
    onValueChange,
    placeholder = 'Select a movie',
    disabled = false,
    error
}: {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    error?: string
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
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive' : 'border-input/80'}`}
            >
                <span className="truncate">{selectedMovie ? selectedMovie.name : placeholder}</span>
                <ChevronRight
                    className={`w-4 h-4 opacity-50 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-[300px] rounded-md border border-border bg-background/95 backdrop-blur-sm shadow-lg animate-in fade-in zoom-in-95">
                    <div className="p-2 border-b border-border">
                        <Input
                            placeholder="Search movies..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="h-8 text-xs"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {isLoading ? (
                            <div className="text-center py-2 text-xs text-muted-foreground">
                                Loading...
                            </div>
                        ) : movies.length === 0 ? (
                            <div className="text-center py-2 text-xs text-muted-foreground">
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
                                        className={`w-full text-left px-2 py-1.5 text-xs rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 ${
                                            value === movie.id ? 'bg-accent' : ''
                                        }`}
                                    >
                                        <img
                                            src={movie.poster}
                                            alt={movie.name}
                                            className="w-6 h-9 object-cover rounded shadow-sm"
                                        />
                                        <span className="flex-1 truncate font-medium">
                                            {movie.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-2 border-t border-border bg-muted/50">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                                className="h-6 w-6 p-0"
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <span className="text-[10px] text-muted-foreground">
                                {page} / {totalPages}
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isLoading}
                                className="h-6 w-6 p-0"
                            >
                                <ChevronRight className="w-3 h-3" />
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
    const location = useLocation()
    const params = useParams({ strict: false }) as { roomId?: string }
    const searchParams = useSearch({ strict: false })
    const date = (searchParams as { date?: string })?.date || new Date().toISOString().split('T')[0]
    const roomId = params.roomId

    const basePath = location.pathname.includes('super-admin') ? '/super-admin' : '/admin'

    const [showTimes, setShowTimes] = useState<ShowTime[]>([])
    const [loading, setLoading] = useState(true)
    const [roomName, setRoomName] = useState<string>('')

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
    // ADD: State lưu lỗi khi edit
    const [editFormErrors, setEditFormErrors] = useState<{ timeStart?: string }>({})

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

    // --- Format Helpers ---
    const formatDate = (dateString: string) => {
        const d = new Date(dateString)
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (dateString: string) => {
        const d = new Date(dateString)
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const formatTimeForInput = (date?: Date) => {
        if (!date) return '00:00'
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
    }

    // --- ADD: Error Handling Helper ---
    const getErrorMessage = (error: unknown, fallback: string) => {
        if (error && typeof error === 'object') {
            const maybeAny = error as {
                response?: { data?: { message?: string; error?: string } }
                message?: string
            }
            const detailed =
                maybeAny.response?.data?.message ||
                maybeAny.response?.data?.error ||
                maybeAny.message
            if (typeof detailed === 'string' && detailed.trim()) return detailed
        }
        return fallback
    }

    // --- ADD: Logic Validate Future Time ---
    const validateFutureTime = (timeObj: Date, dateContext: Date | string): boolean => {
        const now = new Date()
        const checkDate = new Date(dateContext)

        // Reset giờ của dateContext theo timeObj
        checkDate.setHours(timeObj.getHours())
        checkDate.setMinutes(timeObj.getMinutes())
        checkDate.setSeconds(0)
        checkDate.setMilliseconds(0)

        return checkDate > now
    }

    // --- API Logic ---
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
                if (sortedShowTimes.length > 0) {
                    setRoomName(sortedShowTimes[0].room?.name || 'Unknown Room')
                }
            }
        } catch (error) {
            console.error('Failed to fetch showtimes:', error)
            showToast.error(getErrorMessage(error, 'Failed to load showtime details'))
        } finally {
            setLoading(false)
        }
    }, [roomId, date])

    useEffect(() => {
        fetchShowTimes()
    }, [fetchShowTimes])

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await getAllMyBranchRooms()
                if (response.success && response.data) {
                    setRooms(response.data)
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

    useEffect(() => {
        setCreateFormData({
            movieId: '',
            roomId: roomId || '',
            timeStart: new Date(),
            showDate: new Date(date)
        })
    }, [roomId, date])

    // --- Handlers ---
    const handleDeleteShowTime = async (id: string) => {
        if (!confirm('Are you sure you want to delete this showtime?')) return
        try {
            const response = await deleteShowTime(id)
            if (response.success) {
                showToast.success('Showtime deleted successfully!')
                fetchShowTimes()
            } else {
                showToast.error(response.message || 'Error deleting showtime')
            }
        } catch (error) {
            console.error('Error deleting show time:', error)
            showToast.error(getErrorMessage(error, 'Error deleting showtime'))
        }
    }

    const handleEditShowTime = (showTimeId: string) => {
        const showTime = showTimes.find((st) => st.id === showTimeId)
        if (showTime) {
            setEditingShowTime(showTime)
            setEditFormErrors({}) // Reset lỗi khi bắt đầu edit
            setEditFormData({
                movieId: showTime.movie.id,
                roomId: showTime.room.id,
                timeStart: new Date(showTime.timeStart),
                showDate: new Date(showTime.showDate)
            })
        }
    }

    const handleCancelEdit = () => {
        setEditingShowTime(null)
        setEditFormErrors({})
        setEditFormData({
            movieId: '',
            roomId: '',
            timeStart: new Date(),
            showDate: new Date()
        })
    }

    const handleUpdateShowTime = async () => {
        if (!editingShowTime) return

        // Validate time
        if (editFormData.timeStart) {
            const dateContext = editFormData.showDate || editingShowTime.showDate
            if (!validateFutureTime(editFormData.timeStart, dateContext)) {
                setEditFormErrors({ timeStart: 'Time must be in the future' })
                return
            }
        } else {
            setEditFormErrors({ timeStart: 'Time is required' })
            return
        }

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
            showToast.error(getErrorMessage(error, 'Error updating showtime'))
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCreateShowTime = async () => {
        const errors: { movieId?: string; timeStart?: string } = {}
        if (!createFormData.movieId) {
            errors.movieId = 'Movie is required'
        }
        if (!createFormData.timeStart) {
            errors.timeStart = 'Time is required'
        } else {
            // Check future time
            if (!validateFutureTime(createFormData.timeStart, createFormData.showDate)) {
                errors.timeStart = 'Time must be in the future'
            }
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
            showToast.error(getErrorMessage(error, 'Error creating showtime'))
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
            {/* --- Header Section --- */}
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: `${basePath}/show-times` as const })}
                    className="w-fit pl-0 hover:bg-transparent hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Schedule
                </Button>

                {/* Hero Info */}
                <div className="flex flex-col md:flex-row gap-6 bg-card border rounded-xl p-6 shadow-sm items-start md:items-center">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden shadow-md border bg-muted flex items-center justify-center">
                        <MapPin className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/50" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                                {roomName || 'Loading Room...'}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground mt-3">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium capitalize">{formatDate(date)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-primary/10 text-primary py-1 rounded-full text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                <span>{showTimes.length} Sessions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50">
                <div className="px-6 py-4 border-b bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Schedule Details
                    </h2>
                    <Button
                        onClick={() => {
                            setShowCreateForm(!showCreateForm)
                            if (editingShowTime) setEditingShowTime(null)
                        }}
                        className={`transition-all ${showCreateForm ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 border' : 'bg-primary text-primary-foreground'}`}
                        size="sm"
                    >
                        {showCreateForm ? (
                            <>
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" /> Add Showtime
                            </>
                        )}
                    </Button>
                </div>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Loading showtimes...</p>
                        </div>
                    ) : showTimes.length === 0 && !showCreateForm ? (
                        <div className="text-center py-16 text-muted-foreground bg-muted/5">
                            <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>No showtimes scheduled for this room on the selected date.</p>
                        </div>
                    ) : (
                        <div className="overflow-visible">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60px] text-center uppercase text-xs font-bold text-muted-foreground">
                                            #
                                        </TableHead>
                                        <TableHead className="w-[40%] uppercase text-xs font-bold text-muted-foreground">
                                            Movie
                                        </TableHead>
                                        <TableHead className="w-[30%] uppercase text-xs font-bold text-muted-foreground">
                                            Start Time
                                        </TableHead>
                                        <TableHead className="text-right pr-6 uppercase text-xs font-bold text-muted-foreground">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* --- Inline Creation Form --- */}
                                    {showCreateForm && (
                                        <TableRow className="bg-primary/5 border-b-2 border-primary/20 animate-in fade-in slide-in-from-top-2">
                                            <TableCell className="text-center font-bold text-primary text-xs">
                                                NEW
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <PaginatedMovieSelect
                                                        value={createFormData.movieId}
                                                        onValueChange={(value) =>
                                                            setCreateFormData({
                                                                ...createFormData,
                                                                movieId: value
                                                            })
                                                        }
                                                        error={formErrors.movieId}
                                                    />
                                                    {formErrors.movieId && (
                                                        <p className="text-[10px] text-destructive font-medium pl-1">
                                                            {formErrors.movieId}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 w-36">
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
                                                            // Clear error if exists
                                                            if (formErrors.timeStart) {
                                                                setFormErrors((prev) => ({
                                                                    ...prev,
                                                                    timeStart: undefined
                                                                }))
                                                            }
                                                        }}
                                                        className={`h-9 bg-background border-input/80 ${formErrors.timeStart ? 'border-destructive' : ''}`}
                                                    />
                                                    {formErrors.timeStart && (
                                                        <p className="text-[10px] text-destructive font-medium pl-1">
                                                            {formErrors.timeStart}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={handleCreateShowTime}
                                                        disabled={isCreating}
                                                        className="h-8 px-3"
                                                    >
                                                        {isCreating ? (
                                                            '...'
                                                        ) : (
                                                            <>
                                                                <Check className="w-3.5 h-3.5 mr-1" />{' '}
                                                                Save
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* --- List Items --- */}
                                    {showTimes.map((showTime, index) => {
                                        const isEditing = editingShowTime?.id === showTime.id

                                        return (
                                            <TableRow
                                                key={showTime.id}
                                                className={`group transition-colors ${isEditing ? 'bg-muted/50' : 'hover:bg-muted/20'}`}
                                            >
                                                <TableCell className="text-center font-medium text-muted-foreground text-sm">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <div className="max-w-[300px]">
                                                            <PaginatedMovieSelect
                                                                value={editFormData.movieId || ''}
                                                                onValueChange={(value) =>
                                                                    setEditFormData({
                                                                        ...editFormData,
                                                                        movieId: value
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={showTime.movie.poster}
                                                                alt={showTime.movie.name}
                                                                className="w-8 h-12 object-cover rounded shadow-sm"
                                                            />
                                                            <span className="font-medium text-foreground">
                                                                {showTime.movie.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <Input
                                                                type="time"
                                                                value={formatTimeForInput(
                                                                    editFormData.timeStart ||
                                                                        new Date()
                                                                )}
                                                                onChange={(e) => {
                                                                    const [hours, minutes] =
                                                                        e.target.value.split(':')
                                                                    const newDate = new Date(
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
                                                                    // Clear edit error
                                                                    if (editFormErrors.timeStart)
                                                                        setEditFormErrors({})
                                                                }}
                                                                className={`h-8 w-32 bg-background text-base ${editFormErrors.timeStart ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                                            />
                                                            {/* Hiển thị lỗi khi Edit */}
                                                            {editFormErrors.timeStart && (
                                                                <p className="text-[10px] text-destructive font-medium">
                                                                    {editFormErrors.timeStart}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="font-bold text-primary tabular-nums tracking-tight text-lg">
                                                            {formatTime(showTime.timeStart)}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right pr-4">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={handleUpdateShowTime}
                                                                disabled={isUpdating}
                                                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white rounded-full"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={handleCancelEdit}
                                                                disabled={isUpdating}
                                                                className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    handleEditShowTime(showTime.id)
                                                                }
                                                                className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    handleDeleteShowTime(
                                                                        showTime.id
                                                                    )
                                                                }
                                                                className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
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
    )
}

export default ShowTimeRoomDetailPage
