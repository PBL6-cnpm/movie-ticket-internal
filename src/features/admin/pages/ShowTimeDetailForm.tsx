import { getAllMyBranchRooms } from '@/shared/api/room-api'
import {
    createShowTime,
    deleteShowTime,
    getShowTimesByDateAndMovie,
    updateShowTime
} from '@/shared/api/showtime-api'
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
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Check, Clock, Edit, Plus, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const ShowTimeDetailPage = () => {
    const navigate = useNavigate()
    const params = useParams({ strict: false }) as { movieId?: string }
    const searchParams = useSearch({ strict: false })
    const dateQuery = (searchParams as { date?: string })?.date
    const date = dateQuery || new Date().toISOString().split('T')[0]
    const movieId = params.movieId

    const [showTimes, setShowTimes] = useState<ShowTime[]>([])
    const [loading, setLoading] = useState(true)
    const [movieName, setMovieName] = useState<string>('')
    const [moviePoster, setMoviePoster] = useState<string>('')

    // --- State cho Edit ---
    const [editingShowTime, setEditingShowTime] = useState<ShowTime | null>(null)
    const [rooms, setRooms] = useState<Room[]>([])
    const [isUpdating, setIsUpdating] = useState(false)
    const [editFormData, setEditFormData] = useState<UpdateShowTimeRequest>({
        movieId: '',
        roomId: '',
        timeStart: new Date(),
        showDate: new Date()
    })
    const [editFormErrors, setEditFormErrors] = useState<{ timeStart?: string }>({})

    // --- State cho Create ---
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createFormData, setCreateFormData] = useState<CreateShowTimeRequest>({
        movieId: movieId || '',
        roomId: '',
        timeStart: new Date(),
        showDate: new Date(date)
    })
    const [createFormErrors, setCreateFormErrors] = useState<{
        roomId?: string
        timeStart?: string
    }>({})

    // --- Helpers Format ---
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

    // --- Logic Validate Time ---
    const validateFutureTime = (timeObj: Date, dateContext: Date | string): boolean => {
        const now = new Date()
        const checkDate = new Date(dateContext)

        checkDate.setHours(timeObj.getHours())
        checkDate.setMinutes(timeObj.getMinutes())
        checkDate.setSeconds(0)
        checkDate.setMilliseconds(0)

        return checkDate > now
    }

    // --- API Calls ---
    const fetchShowTimes = useCallback(async () => {
        if (!movieId || !date) return

        try {
            setLoading(true)
            const response = await getShowTimesByDateAndMovie(date, movieId)
            if (response.success && response.data) {
                const sortedShowTimes = response.data.sort(
                    (a: ShowTime, b: ShowTime) =>
                        new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime()
                )
                setShowTimes(sortedShowTimes)

                if (sortedShowTimes.length > 0) {
                    setMovieName(sortedShowTimes[0].movie.name)
                    setMoviePoster(sortedShowTimes[0].movie.poster)
                }
            }
        } catch (error) {
            console.error('Failed to fetch showtimes:', error)
            showToast.error(getErrorMessage(error, 'Failed to load showtime details'))
        } finally {
            setLoading(false)
        }
    }, [movieId, date])

    useEffect(() => {
        fetchShowTimes()
    }, [fetchShowTimes])

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await getAllMyBranchRooms()
                if (response.success && response.data) {
                    setRooms(response.data)
                }
            } catch (error) {
                console.error('Error fetching rooms:', error)
            }
        }
        fetchRooms()
    }, [])

    useEffect(() => {
        setCreateFormData({
            movieId: movieId || '',
            roomId: '',
            timeStart: new Date(),
            showDate: new Date(date)
        })
    }, [movieId, date])

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
            setEditFormErrors({})
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

        // FIX: Check if timeStart exists before validating
        if (editFormData.timeStart) {
            // Use editingShowTime.showDate as fallback if editFormData.showDate is undefined
            const dateContext = editFormData.showDate || editingShowTime.showDate

            if (!validateFutureTime(editFormData.timeStart, dateContext)) {
                setEditFormErrors({ timeStart: 'Time must be in the future' })
                return
            }
        } else {
            // Optional: Handle case where timeStart might be undefined/cleared?
            // Usually form input prevents this, but for safety:
            setEditFormErrors({ timeStart: 'Time is required' })
            return
        }

        try {
            setIsUpdating(true)
            const response = await updateShowTime(editingShowTime.id, editFormData)
            if (response.success) {
                showToast.success('Updated successfully!')
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
        const errors: { roomId?: string; timeStart?: string } = {}

        if (!createFormData.roomId) {
            errors.roomId = 'Room is required'
        }
        if (!createFormData.timeStart) {
            errors.timeStart = 'Time is required'
        } else {
            // createFormData.timeStart is defined here (inside else)
            if (!validateFutureTime(createFormData.timeStart, createFormData.showDate)) {
                errors.timeStart = 'Time must be in the future'
            }
        }

        if (Object.keys(errors).length > 0) {
            setCreateFormErrors(errors)
            return
        }

        try {
            setIsCreating(true)
            const response = await createShowTime(createFormData)
            if (response.success) {
                showToast.success('Showtime created successfully!')
                setShowCreateForm(false)
                setCreateFormData({
                    movieId: movieId || '',
                    roomId: '',
                    timeStart: new Date(),
                    showDate: new Date(date)
                })
                setCreateFormErrors({})
                fetchShowTimes()
            } else {
                showToast.error(response.message || 'Error creating showtime')
            }
        } catch (error) {
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
                    onClick={() => navigate({ to: '/admin/show-times' })}
                    className="w-fit pl-0 hover:bg-transparent hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Schedule
                </Button>

                {/* Movie Hero Info */}
                <div className="flex flex-col md:flex-row gap-6 bg-card border rounded-xl p-6 shadow-sm items-start md:items-center">
                    {moviePoster ? (
                        <div className="relative w-24 h-36 md:w-32 md:h-48 shrink-0 rounded-lg overflow-hidden shadow-md border bg-muted">
                            <img
                                src={moviePoster}
                                alt={movieName}
                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-36 md:w-32 md:h-48 shrink-0 rounded-lg bg-muted animate-pulse" />
                    )}

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                                {movieName || 'Loading Movie...'}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground mt-3">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium capitalize">{formatDate(date)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                <span>{showTimes.length} Sessions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Schedule Table --- */}
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
                            <p className="text-sm text-muted-foreground">Loading schedule...</p>
                        </div>
                    ) : showTimes.length === 0 && !showCreateForm ? (
                        <div className="text-center py-16 text-muted-foreground bg-muted/5">
                            <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>No showtimes available for this date.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px] text-center uppercase text-xs font-bold text-muted-foreground">
                                        #
                                    </TableHead>
                                    <TableHead className="w-[40%] uppercase text-xs font-bold text-muted-foreground">
                                        Room
                                    </TableHead>
                                    <TableHead className="w-[30%] uppercase text-xs font-bold text-muted-foreground">
                                        Time
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
                                                <Select
                                                    value={createFormData.roomId}
                                                    onValueChange={(value) =>
                                                        setCreateFormData({
                                                            ...createFormData,
                                                            roomId: value
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger className="h-9 bg-background border-input/80">
                                                        <SelectValue placeholder="Select room" />
                                                    </SelectTrigger>
                                                    {/* <SelectContent className="max-h-[200px]"> */}
                                                    <SelectContent className="bg-background/95 backdrop-blur-sm border-border">
                                                        {rooms.map((room) => (
                                                            <SelectItem
                                                                key={room.id}
                                                                value={room.id}
                                                            >
                                                                {room.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {createFormErrors.roomId && (
                                                    <p className="text-[10px] text-destructive font-medium pl-1">
                                                        {createFormErrors.roomId}
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
                                                        const [h, m] = e.target.value.split(':')
                                                        const d = new Date(
                                                            createFormData.timeStart || new Date()
                                                        ) // Fallback to now if undefined
                                                        d.setHours(parseInt(h), parseInt(m))
                                                        setCreateFormData({
                                                            ...createFormData,
                                                            timeStart: d
                                                        })
                                                        if (createFormErrors.timeStart)
                                                            setCreateFormErrors((prev) => ({
                                                                ...prev,
                                                                timeStart: undefined
                                                            }))
                                                    }}
                                                    className={`h-9 bg-background border-input/80 ${createFormErrors.timeStart ? 'border-destructive' : ''}`}
                                                />
                                                {/* <p className="text-[11px] text-muted-foreground">
                                                    Ends at:{' '}
                                                    {getEndTimeString(
                                                        createFormData.timeStart,
                                                        resolvedDuration as number | null
                                                    )}
                                                </p> */}
                                                {createFormErrors.timeStart && (
                                                    <p className="text-[10px] text-destructive font-medium pl-1">
                                                        {createFormErrors.timeStart}
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
                                                    <Select
                                                        value={editFormData.roomId}
                                                        onValueChange={(value) =>
                                                            setEditFormData({
                                                                ...editFormData,
                                                                roomId: value
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 w-full max-w-[200px] bg-background">
                                                            <SelectValue placeholder="Select room" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-background/95 backdrop-blur-sm border-border">
                                                            {rooms.map((room) => (
                                                                <SelectItem
                                                                    key={room.id}
                                                                    value={room.id}
                                                                >
                                                                    {room.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="font-medium text-foreground">
                                                        {showTime.room?.name || 'Unknown Room'}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    if (isEditing) {
                                                        return (
                                                            <div className="space-y-1">
                                                                <Input
                                                                    type="time"
                                                                    value={formatTimeForInput(
                                                                        editFormData.timeStart
                                                                    )}
                                                                    onChange={(e) => {
                                                                        const [h, m] =
                                                                            e.target.value.split(
                                                                                ':'
                                                                            )
                                                                        const d = new Date(
                                                                            editFormData.timeStart ||
                                                                                new Date()
                                                                        )
                                                                        d.setHours(parseInt(h))
                                                                        d.setMinutes(parseInt(m))
                                                                        setEditFormData({
                                                                            ...editFormData,
                                                                            timeStart: d
                                                                        })
                                                                        if (
                                                                            editFormErrors.timeStart
                                                                        )
                                                                            setEditFormErrors({})
                                                                    }}
                                                                    className={`h-8 w-32 bg-background text-base ${editFormErrors.timeStart ? 'border-destructive focus-visible:ring-destructive' : 'text-red-50'}`}
                                                                />
                                                                {editFormErrors.timeStart && (
                                                                    <p className="text-[10px] text-destructive font-medium">
                                                                        {editFormErrors.timeStart}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    }

                                                    return (
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-primary tabular-nums tracking-tight text-lg">
                                                                {formatTime(showTime.timeStart)}
                                                            </span>
                                                        </div>
                                                    )
                                                })()}
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
                                                                handleDeleteShowTime(showTime.id)
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowTimeDetailPage
