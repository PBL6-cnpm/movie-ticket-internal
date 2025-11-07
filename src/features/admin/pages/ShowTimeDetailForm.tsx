import { getAllMyBranchRooms } from '@/shared/api/room-api'
import {
    createShowTime,
    deleteShowTime,
    getShowTimesByDateAndMovie,
    updateShowTime
} from '@/shared/api/showtime-api'
import Button from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
import {
    ArrowLeft,
    Calendar,
    Clock,
    Edit2,
    Film,
    MapPin,
    MoreHorizontal,
    Trash2
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const ShowTimeDetailPage = () => {
    const navigate = useNavigate()
    const params = useParams({ strict: false }) as { movieId?: string }
    const searchParams = useSearch({ strict: false })
    const date = (searchParams as { date?: string })?.date || new Date().toISOString().split('T')[0]
    const movieId = params.movieId

    const [showTimes, setShowTimes] = useState<ShowTime[]>([])
    const [loading, setLoading] = useState(true)
    const [movieName, setMovieName] = useState<string>('')
    const [moviePoster, setMoviePoster] = useState<string>('')
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Edit state
    const [editingShowTime, setEditingShowTime] = useState<ShowTime | null>(null)
    const [rooms, setRooms] = useState<Room[]>([])
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
        movieId: movieId || '',
        roomId: '',
        timeStart: new Date(),
        showDate: new Date(date)
    })
    const [formErrors, setFormErrors] = useState<{
        roomId?: string
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

                // Get movie info from first showtime
                if (sortedShowTimes.length > 0) {
                    setMovieName(sortedShowTimes[0].movie.name)
                    setMoviePoster(sortedShowTimes[0].movie.poster)
                }
            }
        } catch (error) {
            console.error('Failed to fetch showtimes:', error)
            showToast.error('Failed to load showtime details')
        } finally {
            setLoading(false)
        }
    }, [movieId, date])

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
                }
            } catch (error) {
                console.error('Error fetching rooms:', error)
            }
        }
        fetchRooms()
    }, [])

    // Update createFormData when movieId or date changes
    useEffect(() => {
        setCreateFormData({
            movieId: movieId || '',
            roomId: '',
            timeStart: new Date(),
            showDate: new Date(date)
        })
    }, [movieId, date])

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
                // Refresh showtimes
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
                // Refresh showtimes
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
        const errors: { roomId?: string; timeStart?: string } = {}
        if (!createFormData.roomId) {
            errors.roomId = 'Room is required'
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
                // Reset form
                setShowCreateForm(false)
                setCreateFormData({
                    movieId: movieId || '',
                    roomId: '',
                    timeStart: new Date(),
                    showDate: new Date(date)
                })
                setFormErrors({})
                // Refresh showtimes
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

            {/* Movie Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Film className="w-6 h-6 text-brand" />
                        Showtime Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-6">
                        {moviePoster && (
                            <img
                                src={moviePoster}
                                alt={movieName}
                                className="w-32 h-48 object-cover rounded-lg shadow-lg"
                            />
                        )}
                        <div className="flex-1 space-y-3">
                            <h2 className="text-2xl font-bold">{movieName || 'Loading...'}</h2>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {showTimes.length} showtime{showTimes.length !== 1 ? 's' : ''}{' '}
                                    available
                                </span>
                            </div>
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
                                // Reset editing state
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
                            No showtimes available for this movie on the selected date
                        </div>
                    ) : (
                        <div style={{ overflow: 'visible' }} className="[&>div]:overflow-visible">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">No.</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Room
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
                                                    <Select
                                                        value={createFormData.roomId}
                                                        onValueChange={(value) =>
                                                            setCreateFormData({
                                                                ...createFormData,
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
                                                                movieId: movieId || '',
                                                                roomId: '',
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
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">
                                                                {showTime.room?.name || 'N/A'}
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

                                                                {/* Dropdown Menu */}
                                                                {activeDropdown === showTime.id && (
                                                                    <div
                                                                        ref={dropdownRef}
                                                                        className="absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1"
                                                                    >
                                                                        {/* Arrow pointing to button */}
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

export default ShowTimeDetailPage
