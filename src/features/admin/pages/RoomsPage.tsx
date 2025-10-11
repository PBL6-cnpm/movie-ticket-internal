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
import { useEffect, useState } from 'react'
import type { CreateRoomRequest, Room, UpdateRoomRequest } from '../types/room.type'

const RoomsPage = () => {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false)

    // Edit states
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)
    const [showEditForm, setShowEditForm] = useState<boolean>(false)
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
                    alert(response.message || 'Có lỗi xảy ra khi tải danh sách phòng')
                }
            } catch (error) {
                console.error('Error fetching rooms:', error)
                alert('Có lỗi xảy ra khi tải danh sách phòng')
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
            errors.name = 'Tên phòng là bắt buộc'
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Tên phòng phải có ít nhất 2 ký tự'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Validate edit form
    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!editFormData.name.trim()) {
            errors.name = 'Tên phòng là bắt buộc'
        } else if (editFormData.name.trim().length < 2) {
            errors.name = 'Tên phòng phải có ít nhất 2 ký tự'
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

                alert(`Phòng "${response.data.name}" đã được tạo thành công!`)
            } else {
                alert(response.message || 'Có lỗi xảy ra khi tạo phòng')
            }
        } catch (error: unknown) {
            console.error('Error creating room:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage = apiError.response?.data?.message || 'Có lỗi xảy ra khi tạo phòng'
            alert(errorMessage)
        } finally {
            setIsCreating(false)
        }
    }

    // Handle edit room
    const handleEditRoom = (room: Room) => {
        setEditingRoom(room)
        setEditFormData({ name: room.name })
        setEditFormErrors({})
        setShowEditForm(true)
        setShowCreateForm(false)
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

                setShowEditForm(false)
                setEditingRoom(null)

                alert(`Phòng "${response.data.name}" đã được cập nhật thành công!`)
            } else {
                alert(response.message || 'Có lỗi xảy ra khi cập nhật phòng')
            }
        } catch (error: unknown) {
            console.error('Error updating room:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phòng'
            alert(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle delete room
    const handleDeleteRoom = async (room: Room) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng "${room.name}"?`)) {
            return
        }

        try {
            const response = await deleteRoom(room.id)

            if (response.success) {
                setRooms((prev) => prev.filter((r) => r.id !== room.id))
                alert(`Phòng "${room.name}" đã được xóa thành công!`)
            } else {
                alert(response.message || 'Có lỗi xảy ra khi xóa phòng')
            }
        } catch (error: unknown) {
            console.error('Error deleting room:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage = apiError.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng'
            alert(errorMessage)
        }
    }

    // Handle cancel create form
    const handleCancelCreate = () => {
        setFormData({ name: '' })
        setFormErrors({})
        setShowCreateForm(false)
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditFormData({ name: '' })
        setEditFormErrors({})
        setShowEditForm(false)
        setEditingRoom(null)
    }

    return (
        <div className="mt-6">
            <Card className="bg-surface border-surface">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-primary">Quản lý Phòng Chiếu</CardTitle>
                            <CardDescription className="text-secondary">
                                Quản lý các phòng chiếu trong chi nhánh của bạn
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                            disabled={showCreateForm || showEditForm}
                        >
                            Thêm Phòng Mới
                        </Button>
                    </div>
                </CardHeader>

                {/* Create Form */}
                {showCreateForm && (
                    <CardContent className="border-t border-surface pt-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">
                                Thêm Phòng Chiếu Mới
                            </h3>
                            <div className="max-w-md">
                                <label className="text-sm font-medium text-primary block mb-2">
                                    Tên phòng *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Nhập tên phòng..."
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                        formErrors.name ? 'border-red-500' : ''
                                    }`}
                                />
                                {formErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelCreate}
                                    disabled={isCreating}
                                    className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleCreateRoom}
                                    disabled={isCreating}
                                    className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                >
                                    {isCreating ? 'Đang tạo...' : 'Tạo Phòng'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                )}

                {/* Edit Form */}
                {showEditForm && editingRoom && (
                    <CardContent className="border-t border-surface pt-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">
                                Chỉnh sửa phòng: {editingRoom.name}
                            </h3>
                            <div className="max-w-md">
                                <label className="text-sm font-medium text-primary block mb-2">
                                    Tên phòng *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Nhập tên phòng..."
                                    value={editFormData.name}
                                    onChange={(e) => handleEditInputChange('name', e.target.value)}
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
                            <div className="flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleUpdateRoom}
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
                            <div className="text-secondary">Đang tải danh sách phòng...</div>
                        </div>
                    ) : rooms.length === 0 ? (
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
                            <h3 className="text-lg font-medium text-primary mb-2">
                                Chưa có phòng chiếu nào
                            </h3>
                            <p className="text-secondary">
                                Nhấn "Thêm Phòng Mới" để tạo phòng chiếu đầu tiên
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">
                                Danh sách phòng chiếu ({rooms.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {rooms.map((room) => (
                                    <Card key={room.id} className="bg-brand border-surface">
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-primary text-lg">
                                                        {room.name}
                                                    </h4>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEditRoom(room)}
                                                        className="flex-1 border-surface text-secondary hover:bg-brand hover:text-primary"
                                                        disabled={showCreateForm || showEditForm}
                                                    >
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteRoom(room)}
                                                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        disabled={showCreateForm || showEditForm}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default RoomsPage
