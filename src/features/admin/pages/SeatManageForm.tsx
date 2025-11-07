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
import { showDeleteConfirm } from '@/shared/utils/confirm'
import { showToast } from '@/shared/utils/toast'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
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

    // Ref for dropdown
    const dropdownRef = useRef<HTMLDivElement>(null)

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
                showToast.error('Có lỗi xảy ra khi tải dữ liệu')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [roomId])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node

            // Check if click is inside dropdown
            if (dropdownRef.current && dropdownRef.current.contains(target)) {
                return
            }

            // Check if click is inside Select portal (SelectContent is rendered in a portal)
            const selectPortal = document.querySelector('[data-radix-popper-content-wrapper]')
            if (selectPortal && selectPortal.contains(target)) {
                return
            }

            // Click is outside both dropdown and select portal, close dropdown
            setSelectedSeat(null)
        }

        if (selectedSeat) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [selectedSeat])

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) {
            errors.name = 'Seat name is required'
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Seat name must be at least 2 characters'
        }

        if (!formData.typeSeatId) {
            errors.typeSeatId = 'Please select a seat type'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Validate edit form
    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!editFormData.name.trim()) {
            errors.name = 'Seat name is required'
        } else if (editFormData.name.trim().length < 2) {
            errors.name = 'Seat name must be at least 2 characters'
        }

        if (!editFormData.typeSeatId) {
            errors.typeSeatId = 'Please select a seat type'
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

                showToast.success(`Seat "${response.data.name}" has been created successfully!`)
            } else {
                showToast.error(response.message || 'An error occurred while creating the seat')
            }
        } catch (error: unknown) {
            console.error('Error creating seat:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'An error occurred while creating the seat'
            showToast.error(errorMessage)
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
        // Edit form will show inline in the dropdown
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

                setEditingSeat(null)
                setSelectedSeat(null) // Close dropdown

                showToast.success(`Seat "${response.data.name}" has been updated successfully!`)
            } else {
                showToast.error(response.message || 'An error occurred while updating the seat')
            }
        } catch (error: unknown) {
            console.error('Error updating seat:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'An error occurred while updating the seat'
            showToast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle delete seat
    const handleDeleteSeat = async (seat: Seat) => {
        showDeleteConfirm({
            title: 'Delete Seat',
            message: '',
            itemName: seat.name,
            onConfirm: async () => {
                try {
                    const response = await deleteSeat(seat.id)

                    if (response.success) {
                        setSeats((prev) => prev.filter((s) => s.id !== seat.id))

                        // Clear selected seat if the deleted seat was selected
                        if (selectedSeat?.id === seat.id) {
                            setSelectedSeat(null)
                        }

                        showToast.success(`Seat "${seat.name}" has been deleted successfully!`)
                    } else {
                        showToast.error(
                            response.message || 'An error occurred while deleting the seat'
                        )
                    }
                } catch (error: unknown) {
                    console.error('Error deleting seat:', error)
                    const apiError = error as { response?: { data?: { message?: string } } }
                    const errorMessage =
                        apiError.response?.data?.message ||
                        'An error occurred while deleting the seat'
                    showToast.error(errorMessage)
                }
            }
        })
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
        setEditingSeat(null)
        setSelectedSeat(null) // Also close the dropdown
    }

    // Handle open create form
    const handleOpenCreateForm = () => {
        // Close all other panels/forms
        setSelectedSeat(null)
        setEditingSeat(null)
        setShowCreateForm(true)
    }

    // Handle select seat
    const handleSelectSeat = (seat: Seat) => {
        // Close create form and editing state when selecting a seat
        setShowCreateForm(false)
        setEditingSeat(null)
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
                                    ← Back
                                </Button>
                                <CardTitle className="text-primary">
                                    Seat Management - {currentRoom?.name || 'Select room'}
                                </CardTitle>
                            </div>
                            <CardDescription className="text-secondary">
                                Manage seats in the screening room
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleOpenCreateForm}
                            className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                            disabled={showCreateForm || !roomId}
                        >
                            Add New Seat
                        </Button>
                    </div>
                </CardHeader>

                {/* Type Seat Legend */}
                {typeSeats.length > 0 && (
                    <CardContent className="border-t border-surface pt-4 pb-2">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-sm font-medium text-primary">Seat Types:</span>
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

                {/* Selected Seat Info - Remove this section */}

                {/* Create Form */}
                {showCreateForm && (
                    <CardContent className="border-t border-surface pt-6">
                        <div className="space-y-4 max-w-md mx-auto border border-surface rounded-lg p-6 bg-brand">
                            <h3 className="text-lg font-semibold text-primary text-center">
                                Add New Seat
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-primary block mb-2">
                                        Seat Name *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., A1, B5..."
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
                                        Room
                                    </label>
                                    <Input
                                        type="text"
                                        value={currentRoom?.name || 'Loading...'}
                                        disabled
                                        className="bg-gray-100 border-surface text-gray-600 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-secondary mt-1">
                                        Seat will be created in this room
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary block mb-2">
                                        Seat Type *
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
                                            <SelectValue placeholder="-- Select Seat Type --" />
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
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateSeat}
                                    disabled={isCreating}
                                    className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                >
                                    {isCreating ? 'Creating...' : 'Create Seat'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                )}

                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-secondary">Loading seat list...</div>
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
                                No room selected
                            </h3>
                            <p className="text-secondary">
                                Please select a room to view the seat list
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
                            <h3 className="text-lg font-medium text-primary mb-2">No seats yet</h3>
                            <p className="text-secondary">
                                Click "Add New Seat" to create the first seat for this room
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-primary">
                                Seat List ({seats.length})
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
                                                            className="relative inline-block"
                                                        >
                                                            <div
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
                                                                    backgroundColor:
                                                                        getTypeSeatColor(
                                                                            seat.typeSeat.id
                                                                        )
                                                                }}
                                                                onClick={() =>
                                                                    handleSelectSeat(seat)
                                                                }
                                                                title={`${seat.name} - ${seat.typeSeat.name}`}
                                                            >
                                                                {seat.name}
                                                            </div>

                                                            {/* Dropdown menu below the seat */}
                                                            {selectedSeat?.id === seat.id && (
                                                                <div
                                                                    ref={dropdownRef}
                                                                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 w-64"
                                                                >
                                                                    {/* Arrow pointing up */}
                                                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-[#e86d28]"></div>

                                                                    <div className="bg-surface border-2 border-[#e86d28] rounded-lg shadow-xl p-3">
                                                                        {/* Show edit form if editing this seat */}
                                                                        {editingSeat?.id ===
                                                                        seat.id ? (
                                                                            <div className="space-y-3">
                                                                                <div className="text-center pb-2 border-b border-border">
                                                                                    <div className="font-semibold text-primary text-sm">
                                                                                        Edit Seat
                                                                                    </div>
                                                                                </div>

                                                                                <div>
                                                                                    <label className="text-xs font-medium text-primary block mb-1">
                                                                                        Seat Name *
                                                                                    </label>
                                                                                    <Input
                                                                                        type="text"
                                                                                        placeholder="e.g., A1, B5..."
                                                                                        value={
                                                                                            editFormData.name
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            handleEditInputChange(
                                                                                                'name',
                                                                                                e
                                                                                                    .target
                                                                                                    .value
                                                                                            )
                                                                                        }
                                                                                        className={`bg-brand border-surface text-primary placeholder:text-secondary text-sm ${
                                                                                            editFormErrors.name
                                                                                                ? 'border-red-500'
                                                                                                : ''
                                                                                        }`}
                                                                                    />
                                                                                    {editFormErrors.name && (
                                                                                        <p className="text-red-500 text-xs mt-1">
                                                                                            {
                                                                                                editFormErrors.name
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>

                                                                                <div>
                                                                                    <label className="text-xs font-medium text-primary block mb-1">
                                                                                        Seat Type *
                                                                                    </label>
                                                                                    <Select
                                                                                        value={
                                                                                            editFormData.typeSeatId
                                                                                        }
                                                                                        onValueChange={(
                                                                                            value
                                                                                        ) =>
                                                                                            handleEditInputChange(
                                                                                                'typeSeatId',
                                                                                                value
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger
                                                                                            className={`w-full bg-brand border-surface text-primary hover:bg-[#1f2937] transition-colors text-sm ${
                                                                                                editFormErrors.typeSeatId
                                                                                                    ? 'border-red-500'
                                                                                                    : ''
                                                                                            }`}
                                                                                        >
                                                                                            <SelectValue placeholder="-- Select Type --" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent className="bg-surface border-surface">
                                                                                            {typeSeats.map(
                                                                                                (
                                                                                                    typeSeat
                                                                                                ) => (
                                                                                                    <SelectItem
                                                                                                        key={
                                                                                                            typeSeat.id
                                                                                                        }
                                                                                                        value={
                                                                                                            typeSeat.id
                                                                                                        }
                                                                                                        className="hover:bg-brand focus:bg-brand"
                                                                                                    >
                                                                                                        <div className="font-medium text-primary text-sm">
                                                                                                            {
                                                                                                                typeSeat.name
                                                                                                            }
                                                                                                        </div>
                                                                                                    </SelectItem>
                                                                                                )
                                                                                            )}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                    {editFormErrors.typeSeatId && (
                                                                                        <p className="text-red-500 text-xs mt-1">
                                                                                            {
                                                                                                editFormErrors.typeSeatId
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>

                                                                                <div className="flex space-x-2 pt-1">
                                                                                    <Button
                                                                                        size="sm"
                                                                                        onClick={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.stopPropagation()
                                                                                            handleCancelEdit()
                                                                                        }}
                                                                                        disabled={
                                                                                            isUpdating
                                                                                        }
                                                                                        className="flex-1 bg-transparent border border-surface text-secondary hover:bg-brand hover:text-primary text-xs"
                                                                                    >
                                                                                        ✕
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        onClick={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.stopPropagation()
                                                                                            handleUpdateSeat()
                                                                                        }}
                                                                                        disabled={
                                                                                            isUpdating
                                                                                        }
                                                                                        className="flex-1 bg-[#e86d28] hover:bg-[#d35f1a] text-white text-xs"
                                                                                    >
                                                                                        ✓
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="space-y-2">
                                                                                <div className="text-center pb-2 border-b border-border">
                                                                                    <div className="font-semibold text-primary text-sm">
                                                                                        {seat.name}
                                                                                    </div>
                                                                                    <div className="text-xs text-secondary">
                                                                                        {
                                                                                            seat
                                                                                                .typeSeat
                                                                                                .name
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.stopPropagation()
                                                                                        handleEditSeat(
                                                                                            seat
                                                                                        )
                                                                                    }}
                                                                                    className="w-full border-surface text-secondary hover:bg-brand hover:text-primary"
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.stopPropagation()
                                                                                        handleDeleteSeat(
                                                                                            seat
                                                                                        )
                                                                                    }}
                                                                                    className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                                >
                                                                                    Delete
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
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
