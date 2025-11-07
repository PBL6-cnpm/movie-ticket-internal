import { createRoom, deleteRoom, getAllMyBranchRooms, updateRoom } from '@/shared/api/room-api'
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/components/ui/table'
import { showDeleteConfirm } from '@/shared/utils/confirm'
import { showToast } from '@/shared/utils/toast'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { Edit2, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CreateRoomRequest, Room, UpdateRoomRequest } from '../types/room.type'

const RoomsPage = () => {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine base path (admin or super-admin)
    const basePath = location.pathname.includes('super-admin') ? '/super-admin' : '/admin'

    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false)

    // Edit states
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)

    // Form states
    const [formData, setFormData] = useState<CreateRoomRequest>({
        name: ''
    })

    // Edit form states
    const [editFormData, setEditFormData] = useState<UpdateRoomRequest>({
        name: ''
    })

    // Form validation
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})

    // Dropdown state
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

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

    const toggleDropdown = (roomId: string) => {
        setActiveDropdown(activeDropdown === roomId ? null : roomId)
    }

    // Fetch rooms on component mount
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true)
                const response = await getAllMyBranchRooms()

                if (response.success && response.data) {
                    setRooms(response.data)
                } else {
                    console.error('Failed to fetch rooms:', response.message)
                    showToast.error(response.message || 'An error occurred while loading room list')
                }
            } catch (error) {
                console.error('Error fetching rooms:', error)
                showToast.error('An error occurred while loading room list')
            } finally {
                setLoading(false)
            }
        }

        fetchRooms()
    }, [])

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) {
            errors.name = 'Room name is required'
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Room name must be at least 2 characters'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Validate edit form
    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!editFormData.name.trim()) {
            errors.name = 'Room name is required'
        } else if (editFormData.name.trim().length < 2) {
            errors.name = 'Room name must be at least 2 characters'
        }

        setEditFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle form input changes
    const handleInputChange = (field: keyof CreateRoomRequest, value: string) => {
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
    const handleEditInputChange = (field: keyof UpdateRoomRequest, value: string) => {
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

    // Handle create room
    const handleCreateRoom = async () => {
        if (!validateForm()) {
            return
        }

        setIsCreating(true)
        try {
            const response = await createRoom(formData)

            if (response.success && response.data) {
                setRooms((prev) => [...prev, response.data])

                // Reset form
                setFormData({ name: '' })
                setShowCreateForm(false)

                showToast.success(`Room "${response.data.name}" has been created successfully!`)
            } else {
                showToast.error(response.message || 'An error occurred while creating room')
            }
        } catch (error: unknown) {
            console.error('Error creating room:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'An error occurred while creating room'
            showToast.error(errorMessage)
        } finally {
            setIsCreating(false)
        }
    }

    // Handle edit room
    const handleEditRoom = (room: Room) => {
        setEditingRoom(room)
        setEditFormData({ name: room.name })
        setEditFormErrors({})
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingRoom(null)
        setEditFormData({ name: '' })
        setEditFormErrors({})
    }

    // Handle update room
    const handleUpdateRoom = async () => {
        if (!validateEditForm() || !editingRoom) {
            return
        }

        setIsUpdating(true)
        try {
            const response = await updateRoom(editingRoom.id, editFormData)

            if (response.success && response.data) {
                setRooms((prev) =>
                    prev.map((room) => (room.id === editingRoom.id ? response.data : room))
                )

                setEditingRoom(null)

                showToast.success(`Room "${response.data.name}" has been updated successfully!`)
            } else {
                showToast.error(response.message || 'An error occurred while updating room')
            }
        } catch (error: unknown) {
            console.error('Error updating room:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'An error occurred while updating room'
            showToast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle delete room
    const handleDeleteRoom = async (room: Room) => {
        showDeleteConfirm({
            title: 'Delete Room',
            message: '',
            itemName: room.name,
            onConfirm: async () => {
                try {
                    const response = await deleteRoom(room.id)

                    if (response.success) {
                        setRooms((prev) => prev.filter((r) => r.id !== room.id))
                        showToast.success(`Room "${room.name}" has been deleted successfully!`)
                    } else {
                        showToast.error(response.message || 'An error occurred while deleting room')
                    }
                } catch (error: unknown) {
                    console.error('Error deleting room:', error)
                    const apiError = error as { response?: { data?: { message?: string } } }
                    const errorMessage =
                        apiError.response?.data?.message || 'An error occurred while deleting room'
                    showToast.error(errorMessage)
                }
            }
        })
    }

    // Handle cancel create form
    const handleCancelCreate = () => {
        setFormData({ name: '' })
        setFormErrors({})
        setShowCreateForm(false)
    }

    return (
        <div className="mt-6">
            <Card className="border-0 shadow-none">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-primary">Room Management</CardTitle>
                            <CardDescription className="text-secondary">
                                Manage rooms in your branch
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                            disabled={showCreateForm || editingRoom !== null}
                        >
                            Add New Room
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-secondary">Loading room list...</div>
                        </div>
                    ) : rooms.length === 0 && !showCreateForm ? (
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
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-primary mb-2">No rooms yet</h3>
                            <p className="text-secondary">
                                Click "Add New Room" to create your first room
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">
                                Room list ({rooms.length})
                            </h3>
                            <div className="rounded-md border border-surface bg-brand overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px]">No.</TableHead>
                                            <TableHead>Room name</TableHead>
                                            <TableHead className="text-center w-[300px]">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Create Row - Show at top when creating */}
                                        {showCreateForm && (
                                            <TableRow>
                                                <TableCell className="font-medium text-primary">
                                                    New
                                                </TableCell>
                                                <TableCell className="font-semibold text-primary">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter room name..."
                                                            value={formData.name}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    'name',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                                formErrors.name
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                onClick={handleCreateRoom}
                                                                disabled={isCreating}
                                                                className="btn-primary hover:bg-[#e86d28]"
                                                            >
                                                                {isCreating ? '...' : '✓'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleCancelCreate}
                                                                disabled={isCreating}
                                                                className="border-surface text-secondary"
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                                                        Creating new room...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {/* Existing Rooms */}
                                        {rooms.map((room, index) => (
                                            <TableRow key={room.id}>
                                                <TableCell className="font-medium text-primary">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-semibold text-primary">
                                                    {editingRoom?.id === room.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="text"
                                                                value={editFormData.name}
                                                                onChange={(e) =>
                                                                    handleEditInputChange(
                                                                        'name',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className={`bg-brand border-surface text-primary ${
                                                                    editFormErrors.name
                                                                        ? 'border-red-500'
                                                                        : ''
                                                                }`}
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={handleUpdateRoom}
                                                                    disabled={isUpdating}
                                                                    className="btn-primary hover:bg-[#e86d28]"
                                                                >
                                                                    {isUpdating ? '...' : '✓'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={handleCancelEdit}
                                                                    disabled={isUpdating}
                                                                    className="border-surface text-secondary"
                                                                >
                                                                    ✕
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        room.name
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="relative dropdown-container">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() =>
                                                                    toggleDropdown(room.id)
                                                                }
                                                                className="border border-surface text-secondary hover:bg-brand hover:text-primary h-8 w-8 p-0 transition-colors"
                                                                disabled={
                                                                    showCreateForm ||
                                                                    editingRoom !== null
                                                                }
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>

                                                            {/* Dropdown Menu */}
                                                            {activeDropdown === room.id && (
                                                                <div
                                                                    ref={dropdownRef}
                                                                    className="absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1"
                                                                >
                                                                    {/* Arrow pointing to button */}
                                                                    <div className="absolute -top-2 right-2 w-4 h-4 bg-gray-800 border-t border-l border-gray-700 transform rotate-45 z-[-1]"></div>

                                                                    <button
                                                                        onClick={() => {
                                                                            navigate({
                                                                                to: `${basePath}/rooms/$roomId/seats`,
                                                                                params: {
                                                                                    roomId: room.id
                                                                                }
                                                                            })
                                                                            setActiveDropdown(null)
                                                                        }}
                                                                        className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-green-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                    >
                                                                        <Eye className="w-4 h-4 text-green-400" />
                                                                        View Seats
                                                                    </button>
                                                                    <div className="border-t border-surface my-1" />
                                                                    <button
                                                                        onClick={() => {
                                                                            handleEditRoom(room)
                                                                            setActiveDropdown(null)
                                                                        }}
                                                                        className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-blue-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                    >
                                                                        <Edit2 className="w-4 h-4 text-blue-400" />
                                                                        Edit
                                                                    </button>
                                                                    <div className="border-t border-surface my-1" />
                                                                    <button
                                                                        onClick={() => {
                                                                            handleDeleteRoom(room)
                                                                            setActiveDropdown(null)
                                                                        }}
                                                                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default RoomsPage
