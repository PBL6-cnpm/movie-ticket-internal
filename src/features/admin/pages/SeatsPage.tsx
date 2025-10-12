import { getAllMyBranchRooms } from '@/shared/api/room-api'
import { createSeat, deleteSeat, getSeatsByRoom, updateSeat } from '@/shared/api/seat-api'
import { getAllTypeSeats } from '@/shared/api/type-seat-api'
import Button from '@/shared/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/shared/components/ui/select'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Room } from '../types/room.type'
import type { CreateSeatRequest, Seat, TypeSeat, UpdateSeatRequest } from '../types/seat.type'

const SeatsPage = () => {
    const params = useParams({ strict: false })
    const roomId = params.roomId as string
    const navigate = useNavigate()

    const [seats, setSeats] = useState<Seat[]>([])
    const [typeSeats, setTypeSeats] = useState<TypeSeat[]>([])
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false)

    // Edit states
    const [editingSeat, setEditingSeat] = useState<Seat | null>(null)
    const [showEditForm, setShowEditForm] = useState<boolean>(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)

    // Selected seat state
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)

    // Get color for type seat based on index in typeSeats array
    const getTypeSeatColor = (typeSeatId: string): string => {
        const defaultColors = [
            '#3B82F6', // Blue
            '#F59E0B', // Amber
            '#8B5CF6', // Purple
            '#10B981', // Emerald
            '#EF4444', // Red
            '#6B7280', // Gray
            '#F97316', // Orange
            '#06B6D4', // Cyan
            '#84CC16', // Lime
            '#EC4899', // Pink
            '#8B5A2B', // Brown
            '#6366F1' // Indigo
        ]

        const index = typeSeats.findIndex((ts) => ts.id === typeSeatId)
        if (index !== -1) {
            return defaultColors[index % defaultColors.length]
        }

        // Default color if not found
        return '#6B7280' // Gray
    }

    // Form states
    const [formData, setFormData] = useState<CreateSeatRequest>({
        name: '',
        roomId: roomId || '',
        typeSeatId: ''
    })

    // Edit form states
    const [editFormData, setEditFormData] = useState<UpdateSeatRequest>({
        name: '',
        typeSeatId: ''
    })

    // Form validation
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch rooms, type seats, and seats in parallel
                const [roomsResponse, typeSeatResponse] = await Promise.all([
                    getAllMyBranchRooms(),
                    getAllTypeSeats()
                ])

                // Find current room
                if (roomsResponse.success && roomsResponse.data) {
                    const room = roomsResponse.data.find((r) => r.id === roomId)
                    setCurrentRoom(room || null)
                }

                // Set type seats
                if (typeSeatResponse.success && typeSeatResponse.data) {
                    setTypeSeats(typeSeatResponse.data.items)
                }

                // Fetch seats for the room if roomId exists
                if (roomId) {
                    const seatsResponse = await getSeatsByRoom(roomId)
                    if (seatsResponse.success && seatsResponse.data) {
                        setSeats(seatsResponse.data)
                    }

                    // Update form data with roomId
                    setFormData((prev) => ({ ...prev, roomId }))
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                alert('Có lỗi xảy ra khi tải dữ liệu')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [roomId])

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) {
            errors.name = 'Tên ghế là bắt buộc'
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Tên ghế phải có ít nhất 2 ký tự'
        }

        if (!formData.typeSeatId) {
            errors.typeSeatId = 'Vui lòng chọn loại ghế'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Validate edit form
    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!editFormData.name.trim()) {
            errors.name = 'Tên ghế là bắt buộc'
        } else if (editFormData.name.trim().length < 2) {
            errors.name = 'Tên ghế phải có ít nhất 2 ký tự'
        }

        if (!editFormData.typeSeatId) {
            errors.typeSeatId = 'Vui lòng chọn loại ghế'
        }

        setEditFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle form input changes
    const handleInputChange = (field: keyof CreateSeatRequest, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }))

        // Clear error for this field when user starts typing
        if (formErrors[field]) {
            setFormErrors((prev) => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    // Handle edit form input changes
    const handleEditInputChange = (field: keyof UpdateSeatRequest, value: string) => {
        setEditFormData((prev) => ({
            ...prev,
            [field]: value
        }))

        // Clear error for this field when user starts typing
        if (editFormErrors[field]) {
            setEditFormErrors((prev) => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    // Handle create seat
    const handleCreateSeat = async () => {
        if (!validateForm()) {
            return
        }

        setIsCreating(true)
        try {
            const response = await createSeat(formData)

            if (response.success && response.data) {
                setSeats((prev) => [...prev, response.data])

                // Reset form
                setFormData({
                    name: '',
                    roomId: roomId || '',
                    typeSeatId: ''
                })
                setShowCreateForm(false)

                alert(`Ghế "${response.data.name}" đã được tạo thành công!`)
            } else {
                alert(response.message || 'Có lỗi xảy ra khi tạo ghế')
            }
        } catch (error: unknown) {
            console.error('Error creating seat:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage = apiError.response?.data?.message || 'Có lỗi xảy ra khi tạo ghế'
            alert(errorMessage)
        } finally {
            setIsCreating(false)
        }
    }

    // Handle edit seat
    const handleEditSeat = (seat: Seat) => {
        setEditingSeat(seat)
        setEditFormData({
            name: seat.name,
            typeSeatId: seat.typeSeat.id
        })
        setEditFormErrors({})
        setShowEditForm(true)
        setShowCreateForm(false)
    }

    // Handle update seat
    const handleUpdateSeat = async () => {
        if (!validateEditForm() || !editingSeat) {
            return
        }

        setIsUpdating(true)
        try {
            const response = await updateSeat(editingSeat.id, editFormData)

            if (response.success && response.data) {
                setSeats((prev) =>
                    prev.map((seat) => (seat.id === editingSeat.id ? response.data : seat))
                )

                setShowEditForm(false)
                setEditingSeat(null)
                setSelectedSeat(null) // Close selected seat panel

                alert(`Ghế "${response.data.name}" đã được cập nhật thành công!`)
            } else {
                alert(response.message || 'Có lỗi xảy ra khi cập nhật ghế')
            }
        } catch (error: unknown) {
            console.error('Error updating seat:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ghế'
            alert(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle delete seat
    const handleDeleteSeat = async (seat: Seat) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ghế "${seat.name}"?`)) {
            return
        }

        try {
            const response = await deleteSeat(seat.id)

            if (response.success) {
                setSeats((prev) => prev.filter((s) => s.id !== seat.id))

                // Clear selected seat if the deleted seat was selected
                if (selectedSeat?.id === seat.id) {
                    setSelectedSeat(null)
                }

                alert(`Ghế "${seat.name}" đã được xóa thành công!`)
            } else {
                alert(response.message || 'Có lỗi xảy ra khi xóa ghế')
            }
        } catch (error: unknown) {
            console.error('Error deleting seat:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage = apiError.response?.data?.message || 'Có lỗi xảy ra khi xóa ghế'
            alert(errorMessage)
        }
    }

    // Handle cancel create form
    const handleCancelCreate = () => {
        setFormData({
            name: '',
            roomId: roomId || '',
            typeSeatId: ''
        })
        setFormErrors({})
        setShowCreateForm(false)
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditFormData({
            name: '',
            typeSeatId: ''
        })
        setEditFormErrors({})
        setShowEditForm(false)
        setEditingSeat(null)
    }

    // Handle open create form
    const handleOpenCreateForm = () => {
        // Close all other panels/forms
        setSelectedSeat(null)
        setShowEditForm(false)
        setEditingSeat(null)
        setShowCreateForm(true)
    }

    // Handle close selected seat
    const handleCloseSelectedSeat = () => {
        // Close selected seat and edit form
        setSelectedSeat(null)
        setShowEditForm(false)
        setEditingSeat(null)
    }

    // Handle select seat
    const handleSelectSeat = (seat: Seat) => {
        // Close create form and edit form when selecting a seat
        setShowCreateForm(false)
        setShowEditForm(false)
        setSelectedSeat(seat)
    }

    return (
        <div className="mt-6">
            <Card className="bg-surface border-surface">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate({ to: '/admin/rooms' })}
                                    className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                >
                                    ← Quay lại
                                </Button>
                                <CardTitle className="text-primary">
                                    Quản lý Ghế - {currentRoom?.name || 'Chọn phòng'}
                                </CardTitle>
                            </div>
                            <CardDescription className="text-secondary">
                                Quản lý các ghế trong phòng chiếu
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleOpenCreateForm}
                            className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                            disabled={showCreateForm || showEditForm || !roomId}
                        >
                            Thêm Ghế Mới
                        </Button>
                    </div>
                </CardHeader>

                {/* Type Seat Legend */}
                {typeSeats.length > 0 && (
                    <CardContent className="border-t border-surface pt-4 pb-2">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-sm font-medium text-primary">Loại ghế:</span>
                            {typeSeats.map((typeSeat) => (
                                <div key={typeSeat.id} className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded border border-gray-300"
                                        style={{ backgroundColor: getTypeSeatColor(typeSeat.id) }}
                                    ></div>
                                    <span className="text-sm text-secondary">{typeSeat.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}

                {/* Selected Seat Info */}
                {selectedSeat && (
                    <CardContent className="border-t border-surface pt-4 pb-4">
                        <div className="bg-brand border border-surface rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-primary">
                                        Ghế {selectedSeat.name}
                                    </h4>
                                    <p className="text-secondary">
                                        Loại: {selectedSeat.typeSeat.name}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditSeat(selectedSeat)}
                                        className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                        disabled={showCreateForm || showEditForm}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteSeat(selectedSeat)}
                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        disabled={showCreateForm || showEditForm}
                                    >
                                        Xóa
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCloseSelectedSeat}
                                        className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                    >
                                        Đóng
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <CardContent className="border-t border-surface pt-6">
                        <div className="space-y-4 max-w-md mx-auto border border-surface rounded-lg p-6 bg-brand">
                            <h3 className="text-lg font-semibold text-primary text-center">
                                Thêm Ghế Mới
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-primary block mb-2">
                                        Tên ghế *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="VD: A1, B5..."
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                            formErrors.name ? 'border-red-500' : ''
                                        }`}
                                    />
                                    {formErrors.name && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {formErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary block mb-2">
                                        Phòng
                                    </label>
                                    <Input
                                        type="text"
                                        value={currentRoom?.name || 'Đang tải...'}
                                        disabled
                                        className="bg-gray-100 border-surface text-gray-600 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-secondary mt-1">
                                        Ghế sẽ được tạo trong phòng này
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary block mb-2">
                                        Loại ghế *
                                    </label>
                                    <Select
                                        value={formData.typeSeatId}
                                        onValueChange={(value) =>
                                            handleInputChange('typeSeatId', value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={`w-full bg-brand border-surface text-primary hover:bg-[#1f2937] transition-colors ${
                                                formErrors.typeSeatId ? 'border-red-500' : ''
                                            }`}
                                        >
                                            <SelectValue placeholder="-- Chọn loại ghế --" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-surface border-surface">
                                            {typeSeats.map((typeSeat) => (
                                                <SelectItem
                                                    key={typeSeat.id}
                                                    value={typeSeat.id}
                                                    className="hover:bg-brand focus:bg-brand"
                                                >
                                                    <div className="font-medium text-primary">
                                                        {typeSeat.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.typeSeatId && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {formErrors.typeSeatId}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-3 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelCreate}
                                    disabled={isCreating}
                                    className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleCreateSeat}
                                    disabled={isCreating}
                                    className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                >
                                    {isCreating ? 'Đang tạo...' : 'Tạo Ghế'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                )}

                {/* Edit Form */}
                {showEditForm && editingSeat && (
                    <CardContent className="border-t border-surface pt-6">
                        <div className="space-y-4 max-w-md mx-auto border border-surface rounded-lg p-6 bg-brand">
                            <h3 className="text-lg font-semibold text-primary text-center">
                                Chỉnh sửa ghế: {editingSeat.name}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-primary block mb-2">
                                        Tên ghế *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="VD: A1, B5..."
                                        value={editFormData.name}
                                        onChange={(e) =>
                                            handleEditInputChange('name', e.target.value)
                                        }
                                        className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                            editFormErrors.name ? 'border-red-500' : ''
                                        }`}
                                    />
                                    {editFormErrors.name && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {editFormErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary block mb-2">
                                        Loại ghế *
                                    </label>
                                    <Select
                                        value={editFormData.typeSeatId}
                                        onValueChange={(value) =>
                                            handleEditInputChange('typeSeatId', value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={`w-full bg-brand border-surface text-primary hover:bg-[#1f2937] transition-colors ${
                                                editFormErrors.typeSeatId ? 'border-red-500' : ''
                                            }`}
                                        >
                                            <SelectValue placeholder="-- Chọn loại ghế --" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-surface border-surface">
                                            {typeSeats.map((typeSeat) => (
                                                <SelectItem
                                                    key={typeSeat.id}
                                                    value={typeSeat.id}
                                                    className="hover:bg-brand focus:bg-brand"
                                                >
                                                    <div className="font-medium text-primary">
                                                        {typeSeat.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editFormErrors.typeSeatId && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {editFormErrors.typeSeatId}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-3 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleUpdateSeat}
                                    disabled={isUpdating}
                                    className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                >
                                    {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                )}

                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-secondary">Đang tải danh sách ghế...</div>
                        </div>
                    ) : !roomId ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-brand border border-surface rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-secondary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-primary mb-2">
                                Chưa chọn phòng
                            </h3>
                            <p className="text-secondary">
                                Vui lòng chọn phòng để xem danh sách ghế
                            </p>
                        </div>
                    ) : seats.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-brand border border-surface rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-secondary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-primary mb-2">
                                Chưa có ghế nào
                            </h3>
                            <p className="text-secondary">
                                Nhấn "Thêm Ghế Mới" để tạo ghế đầu tiên cho phòng này
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-primary">
                                Danh sách ghế ({seats.length})
                            </h3>

                            {(() => {
                                // Group seats by row (first letter of seat name)
                                const seatsByRow = seats.reduce(
                                    (acc, seat) => {
                                        const rowLetter = seat.name.charAt(0).toUpperCase()
                                        if (!acc[rowLetter]) {
                                            acc[rowLetter] = []
                                        }
                                        acc[rowLetter].push(seat)
                                        return acc
                                    },
                                    {} as Record<string, Seat[]>
                                )

                                // Sort rows alphabetically
                                const sortedRows = Object.keys(seatsByRow).sort()

                                return sortedRows.map((rowLetter) => {
                                    // Sort seats within each row by number
                                    const rowSeats = seatsByRow[rowLetter].sort((a, b) => {
                                        const aNum = parseInt(a.name.substring(1)) || 0
                                        const bNum = parseInt(b.name.substring(1)) || 0
                                        return aNum - bNum
                                    })

                                    return (
                                        <div key={rowLetter} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="bg-brand border border-surface rounded-lg px-4 py-2 min-w-[50px] text-center">
                                                    <div className="font-bold text-primary text-xl">
                                                        {rowLetter}
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-wrap gap-1 justify-center">
                                                    {rowSeats.map((seat) => (
                                                        <div
                                                            key={seat.id}
                                                            className={`
                                                                w-12 h-12 rounded-lg border-2 cursor-pointer 
                                                                flex items-center justify-center text-white font-bold text-sm
                                                                transition-all duration-200 hover:scale-110 hover:shadow-lg
                                                                ${
                                                                    selectedSeat?.id === seat.id
                                                                        ? 'border-white shadow-lg scale-110'
                                                                        : 'border-gray-400'
                                                                }
                                                            `}
                                                            style={{
                                                                backgroundColor: getTypeSeatColor(
                                                                    seat.typeSeat.id
                                                                )
                                                            }}
                                                            onClick={() => handleSelectSeat(seat)}
                                                            title={`${seat.name} - ${seat.typeSeat.name}`}
                                                        >
                                                            {seat.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            })()}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default SeatsPage
