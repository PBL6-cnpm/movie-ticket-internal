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
import type {
    CreateShowTimeRequest,
    Room,
    ShowTime,
    UpdateShowTimeRequest
} from '@/shared/types/showtime.types'
import { useEffect, useState } from 'react'

// Add keyframe animation for smooth card movement
const styleSheet = document.createElement('style')
styleSheet.textContent = `
    @keyframes slideToTop {
        0% {
            transform: translateY(20px);
            opacity: 0.8;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }
`
if (!document.head.querySelector('#showtime-animations')) {
    styleSheet.id = 'showtime-animations'
    document.head.appendChild(styleSheet)
}

// Paginated Movie Select Component
const PaginatedMovieSelect = ({
    value,
    onValueChange,
    placeholder = 'Chọn phim từ danh sách',
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

    const handleSearch = () => {
        setPage(1)
        fetchMovies(1, searchQuery)
    }

    const totalPages = Math.ceil(total / pageSize)
    const selectedMovie = movies?.find((m) => m.id === value)

    return (
        <div className="relative">
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
                <div className="absolute z-50 w-full mt-1 bg-popover/95 backdrop-blur-sm border border-border rounded-md shadow-lg max-h-96 overflow-hidden flex flex-col">
                    {/* Search Header */}
                    <div className="p-3 border-b bg-muted/60 shrink-0">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Tìm phim..."
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
                                {isLoading ? 'Tìm...' : 'Tìm'}
                            </Button>
                        </div>

                        {/* Pagination Info */}
                        <div className="mt-2 text-xs text-muted-foreground">
                            {total > 0 ? (
                                <>
                                    Trang {page}/{totalPages} ({total} phim)
                                </>
                            ) : (
                                <>Không tìm thấy phim nào</>
                            )}
                        </div>
                    </div>

                    {/* Movie List */}
                    <div className="max-h-48 overflow-y-auto flex-1">
                        {isLoading ? (
                            <div className="p-3 text-center text-muted-foreground">Đang tải...</div>
                        ) : movies && movies.length > 0 ? (
                            movies.map((movie) => (
                                <button
                                    key={movie.id}
                                    type="button"
                                    className={`w-full px-3 py-2 text-left hover:bg-accent/50 focus:bg-accent/50 border-0 transition-colors ${
                                        movie.id === value ? 'bg-accent/50' : 'bg-transparent'
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
                                Không có phim nào
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer - Always show when movies are loaded */}
                    {!isLoading && movies && movies.length > 0 && (
                        <div className="p-2 border-t bg-muted/50 shrink-0">
                            <div className="flex items-center justify-between gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page <= 1 || isLoading}
                                    onClick={() => setPage((prev) => prev - 1)}
                                    className="h-7 px-2 text-xs shrink-0"
                                    title="Trang trước"
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
                                                        <span className="text-xs px-1">...</span>
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

                                                if (pageNum < 1 || pageNum > totalPages) return null

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
                                            })}

                                            {page < totalPages - 1 && (
                                                <>
                                                    {page < totalPages - 2 && (
                                                        <span className="text-xs px-1">...</span>
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
                                    title="Trang sau"
                                >
                                    ▶
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
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
    const [showEditForm, setShowEditForm] = useState<boolean>(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)

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
                alert('Có lỗi xảy ra khi tải dữ liệu')
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
                const response = await getShowTimesByDate(selectedDate)
                console.log('ShowTimes response:', response)
                if (response.success && response.data) {
                    console.log('ShowTimes data:', response.data)
                    setShowTimes(response.data)
                }
            } catch (error) {
                console.error('Error fetching show times:', error)
                alert('Có lỗi xảy ra khi tải lịch chiếu')
            }
        }

        if (selectedDate) {
            fetchShowTimes()
        }
    }, [selectedDate])

    // Format datetime for input field
    const formatDateTimeForInput = (date: Date | string): string => {
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
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
            errors.movieId = 'Vui lòng chọn phim'
        }

        if (!formData.roomId) {
            errors.roomId = 'Vui lòng chọn phòng chiếu'
        }

        if (!formData.timeStart) {
            errors.timeStart = 'Vui lòng chọn giờ bắt đầu'
        }

        if (!formData.showDate) {
            errors.showDate = 'Vui lòng chọn ngày chiếu'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Validate edit form
    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!editFormData.movieId) {
            errors.movieId = 'Vui lòng chọn phim'
        }

        if (!editFormData.roomId) {
            errors.roomId = 'Vui lòng chọn phòng chiếu'
        }

        if (!editFormData.timeStart) {
            errors.timeStart = 'Vui lòng chọn giờ bắt đầu'
        }

        if (!editFormData.showDate) {
            errors.showDate = 'Vui lòng chọn ngày chiếu'
        }

        setEditFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle create show time
    const handleCreateShowTime = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateCreateForm()) {
            return
        }

        try {
            setIsCreating(true)
            const response = await createShowTime(formData)

            if (response.success) {
                alert('Thêm lịch chiếu thành công!')
                setShowCreateForm(false)
                setFormData({
                    movieId: '',
                    roomId: '',
                    timeStart: new Date(),
                    showDate: new Date()
                })
                setFormErrors({})

                // Refresh show times list
                const showTimesResponse = await getShowTimesByDate(selectedDate)
                if (showTimesResponse.success && showTimesResponse.data) {
                    setShowTimes(showTimesResponse.data)
                }
            } else {
                alert(response.message || 'Có lỗi xảy ra khi thêm lịch chiếu')
            }
        } catch (error) {
            console.error('Error creating show time:', error)
            alert('Có lỗi xảy ra khi thêm lịch chiếu')
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
        setShowEditForm(true)
        setEditFormErrors({})
        // Close create form if it's open
        if (showCreateForm) setShowCreateForm(false)

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
                alert('Cập nhật lịch chiếu thành công!')
                setShowEditForm(false)
                setEditingShowTime(null)
                setEditFormErrors({})

                // Refresh show times list
                const showTimesResponse = await getShowTimesByDate(selectedDate)
                if (showTimesResponse.success && showTimesResponse.data) {
                    setShowTimes(showTimesResponse.data)
                }
            } else {
                alert(response.message || 'Có lỗi xảy ra khi cập nhật lịch chiếu')
            }
        } catch (error) {
            console.error('Error updating show time:', error)
            alert('Có lỗi xảy ra khi cập nhật lịch chiếu')
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle delete show time
    const handleDeleteShowTime = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
            return
        }

        try {
            const response = await deleteShowTime(id)

            if (response.success) {
                alert('Xóa lịch chiếu thành công!')

                // Refresh show times list
                const showTimesResponse = await getShowTimesByDate(selectedDate)
                if (showTimesResponse.success && showTimesResponse.data) {
                    setShowTimes(showTimesResponse.data)
                }
            } else {
                alert(response.message || 'Có lỗi xảy ra khi xóa lịch chiếu')
            }
        } catch (error) {
            console.error('Error deleting show time:', error)
            alert('Có lỗi xảy ra khi xóa lịch chiếu')
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-brand">Quản lý lịch chiếu</h1>
                <Button
                    onClick={() => {
                        setShowCreateForm(!showCreateForm)
                        if (showEditForm) setShowEditForm(false)
                        // Reset editing state to return list to normal
                        if (editingShowTime) setEditingShowTime(null)
                    }}
                    className="btn-primary hover:bg-[#e86d28]"
                >
                    {showCreateForm ? 'Ẩn form' : 'Thêm lịch chiếu'}
                </Button>
            </div>

            <div className="space-y-6">
                {/* Date Selection */}
                <div className="flex items-center gap-4">
                    <Label htmlFor="date">Chọn ngày</Label>
                    <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSelectedDate(e.target.value)
                        }
                        className="w-48"
                    />
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <Card className="border-brand/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Thêm lịch chiếu mới</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateShowTime} className="space-y-4">
                                {/* Movie Selection */}
                                <div className="space-y-2">
                                    <Label>Chọn phim</Label>
                                    <PaginatedMovieSelect
                                        value={formData.movieId}
                                        onValueChange={(movieId) =>
                                            setFormData({ ...formData, movieId })
                                        }
                                        placeholder="Chọn phim từ danh sách"
                                    />
                                    {formErrors.movieId && (
                                        <p className="text-sm text-red-500">{formErrors.movieId}</p>
                                    )}
                                </div>

                                {/* Room, Time, Date Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="room">Phòng chiếu</Label>
                                        <Select
                                            value={formData.roomId}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, roomId: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn phòng chiếu" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-sm border-border">
                                                {rooms.map((room) => (
                                                    <SelectItem
                                                        key={room.id}
                                                        value={room.id}
                                                        className="hover:bg-accent focus:bg-accent"
                                                    >
                                                        {room.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.roomId && (
                                            <p className="text-sm text-red-500">
                                                {formErrors.roomId}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timeStart">Giờ bắt đầu</Label>
                                        <Input
                                            id="timeStart"
                                            type="datetime-local"
                                            value={formatDateTimeForInput(formData.timeStart)}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setFormData({
                                                    ...formData,
                                                    timeStart: new Date(e.target.value)
                                                })
                                            }
                                        />
                                        {formErrors.timeStart && (
                                            <p className="text-sm text-red-500">
                                                {formErrors.timeStart}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="showDate">Ngày chiếu</Label>
                                        <Input
                                            id="showDate"
                                            type="date"
                                            value={
                                                formData.showDate instanceof Date
                                                    ? getLocalDateString(formData.showDate)
                                                    : formData.showDate
                                            }
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setFormData({
                                                    ...formData,
                                                    showDate: new Date(e.target.value)
                                                })
                                            }
                                        />
                                        {formErrors.showDate && (
                                            <p className="text-sm text-red-500">
                                                {formErrors.showDate}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={isCreating}
                                        className="btn-primary hover:bg-[#e86d28]"
                                    >
                                        {isCreating ? 'Đang tạo...' : 'Tạo lịch chiếu'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowCreateForm(false)
                                            setFormErrors({})
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Edit Form */}
                {showEditForm && editingShowTime && (
                    <Card className="border-brand/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Chỉnh sửa lịch chiếu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateShowTime} className="space-y-4">
                                {/* Movie Selection */}
                                <div className="space-y-2">
                                    <Label>Chọn phim</Label>
                                    <PaginatedMovieSelect
                                        value={editFormData.movieId || ''}
                                        onValueChange={(movieId) =>
                                            setEditFormData({ ...editFormData, movieId })
                                        }
                                        placeholder="Chọn phim từ danh sách"
                                    />
                                    {editFormErrors.movieId && (
                                        <p className="text-sm text-red-500">
                                            {editFormErrors.movieId}
                                        </p>
                                    )}
                                </div>

                                {/* Room, Time, Date Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editRoom">Phòng chiếu</Label>
                                        <Select
                                            value={editFormData.roomId}
                                            onValueChange={(value) =>
                                                setEditFormData({ ...editFormData, roomId: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn phòng chiếu" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover/95 backdrop-blur-sm border-border">
                                                {rooms.map((room) => (
                                                    <SelectItem
                                                        key={room.id}
                                                        value={room.id}
                                                        className="hover:bg-accent focus:bg-accent"
                                                    >
                                                        {room.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {editFormErrors.roomId && (
                                            <p className="text-sm text-red-500">
                                                {editFormErrors.roomId}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="editTimeStart">Giờ bắt đầu</Label>
                                        <Input
                                            id="editTimeStart"
                                            type="datetime-local"
                                            value={formatDateTimeForInput(
                                                editFormData.timeStart || new Date()
                                            )}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    timeStart: new Date(e.target.value)
                                                })
                                            }
                                        />
                                        {editFormErrors.timeStart && (
                                            <p className="text-sm text-red-500">
                                                {editFormErrors.timeStart}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="editShowDate">Ngày chiếu</Label>
                                        <Input
                                            id="editShowDate"
                                            type="date"
                                            value={
                                                editFormData.showDate instanceof Date
                                                    ? getLocalDateString(editFormData.showDate)
                                                    : editFormData.showDate
                                            }
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    showDate: new Date(e.target.value)
                                                })
                                            }
                                        />
                                        {editFormErrors.showDate && (
                                            <p className="text-sm text-red-500">
                                                {editFormErrors.showDate}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="btn-primary hover:bg-[#e86d28]"
                                    >
                                        {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowEditForm(false)
                                            setEditingShowTime(null)
                                            setEditFormErrors({})
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Show Times List */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Lịch chiếu ngày {formatDate(selectedDate)} ({showTimes.length} suất
                            chiếu)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {showTimes.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Không có lịch chiếu nào cho ngày này
                            </p>
                        ) : (
                            <div className="space-y-6 transition-all duration-500">
                                {/* Group show times by movie */}
                                {Object.entries(
                                    showTimes.reduce(
                                        (groups, showTime) => {
                                            if (!showTime.movie) return groups

                                            const movieId = showTime.movie.id
                                            if (!groups[movieId]) {
                                                groups[movieId] = {
                                                    movie: showTime.movie,
                                                    times: []
                                                }
                                            }
                                            groups[movieId].times.push(showTime)
                                            return groups
                                        },
                                        {} as Record<string, { movie: Movie; times: ShowTime[] }>
                                    )
                                )
                                    // Sort: movie being edited first, then others
                                    .sort(([, { times: timesA }], [, { times: timesB }]) => {
                                        const isEditingA =
                                            editingShowTime &&
                                            timesA.some((t) => t.id === editingShowTime.id)
                                        const isEditingB =
                                            editingShowTime &&
                                            timesB.some((t) => t.id === editingShowTime.id)

                                        if (isEditingA && !isEditingB) return -1 // A lên đầu
                                        if (!isEditingA && isEditingB) return 1 // B lên đầu
                                        return 0 // Giữ nguyên thứ tự
                                    })
                                    .map(([movieId, { movie, times }]) => {
                                        // Check if this movie group contains the editing showtime
                                        const isEditingThisMovie =
                                            editingShowTime &&
                                            times.some((t) => t.id === editingShowTime.id)

                                        return (
                                            <Card
                                                key={movieId}
                                                className={`border-brand/10 overflow-hidden transition-all duration-500 ease-in-out ${isEditingThisMovie ? 'ring-2 ring-brand shadow-lg scale-[1.01]' : ''}`}
                                                style={{
                                                    animation: isEditingThisMovie
                                                        ? 'slideToTop 0.5s ease-out'
                                                        : 'none'
                                                }}
                                            >
                                                <CardContent className="p-0">
                                                    {/* Movie Header - Compact */}
                                                    <div
                                                        className={`flex gap-3 p-3 transition-all ${isEditingThisMovie ? 'bg-brand/10' : 'bg-muted/30'}`}
                                                    >
                                                        <img
                                                            src={movie.poster}
                                                            alt={movie.name}
                                                            className="w-16 h-24 object-cover rounded shadow-sm"
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold mb-1 line-clamp-2">
                                                                {movie.name}
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                {times.length} suất chiếu
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Show Times Grid - Compact */}
                                                    <div className="p-3">
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                            {times
                                                                .sort(
                                                                    (a, b) =>
                                                                        new Date(
                                                                            a.timeStart
                                                                        ).getTime() -
                                                                        new Date(
                                                                            b.timeStart
                                                                        ).getTime()
                                                                )
                                                                .map((showTime) => {
                                                                    const isEditing =
                                                                        editingShowTime?.id ===
                                                                        showTime.id
                                                                    return (
                                                                        <div
                                                                            key={showTime.id}
                                                                            className={`group relative border rounded-lg p-2 hover:border-brand hover:bg-brand/5 transition-all cursor-pointer ${
                                                                                isEditing
                                                                                    ? 'border-blue-500 bg-brand/10 ring-2 ring-blue-500 shadow-md'
                                                                                    : 'border-border'
                                                                            }`}
                                                                        >
                                                                            {/* Time Display - Compact */}
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <span className="text-xl font-bold text-brand">
                                                                                    {formatTime(
                                                                                        showTime.timeStart
                                                                                    )}
                                                                                </span>
                                                                            </div>

                                                                            {/* Room Info - Compact */}
                                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                                                                <svg
                                                                                    className="w-3 h-3"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={
                                                                                            2
                                                                                        }
                                                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                                                    />
                                                                                </svg>
                                                                                <span className="truncate">
                                                                                    {showTime.room
                                                                                        ?.name ||
                                                                                        'N/A'}
                                                                                </span>
                                                                            </div>

                                                                            {/* Action Buttons - Compact */}
                                                                            <div
                                                                                className={`flex gap-1 transition-opacity ${
                                                                                    isEditing
                                                                                        ? 'opacity-100'
                                                                                        : 'opacity-0 group-hover:opacity-100'
                                                                                }`}
                                                                            >
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() =>
                                                                                        handleEditShowTime(
                                                                                            showTime
                                                                                        )
                                                                                    }
                                                                                    className="flex-1 h-7 text-xs px-2"
                                                                                >
                                                                                    Sửa
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="destructive"
                                                                                    onClick={() =>
                                                                                        handleDeleteShowTime(
                                                                                            showTime.id
                                                                                        )
                                                                                    }
                                                                                    className="flex-1 h-7 text-xs px-2"
                                                                                >
                                                                                    Xóa
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ShowTimePage
