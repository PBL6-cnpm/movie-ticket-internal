import type {
    CreateTypeSeatRequest,
    TypeSeat,
    UpdateTypeSeatRequest
} from '@/features/super-admin/types/type-seat.type'
import { createTypeSeat, getAllTypeSeats, updateTypeSeat } from '@/shared/api/type-seat-api'
import Button from '@/shared/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import React, { useEffect, useState } from 'react'

const TypeSeatManageForm: React.FC = () => {
    const [typeSeats, setTypeSeats] = useState<TypeSeat[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false)

    // Edit states
    const [editingTypeSeat, setEditingTypeSeat] = useState<TypeSeat | null>(null)
    const [showEditForm, setShowEditForm] = useState<boolean>(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize] = useState<number>(10)
    const [totalItems, setTotalItems] = useState<number>(0)

    // Form states
    const [formData, setFormData] = useState<CreateTypeSeatRequest>({
        name: '',
        price: 0,
        isCurrent: false
    })

    // Edit form states
    const [editFormData, setEditFormData] = useState<UpdateTypeSeatRequest>({
        name: '',
        price: 0,
        isCurrent: false
    })

    // Form validation
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})

    // Fetch type seats on component mount and page change
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await getAllTypeSeats({
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize
                })

                if (response.success && response.data && response.data.items) {
                    setTypeSeats(response.data.items)
                    setTotalItems(response.data.meta.total || 0)
                }
            } catch (error) {
                console.error('Error fetching type seats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [currentPage, pageSize])

    // Form validation
    const validateForm = (data: CreateTypeSeatRequest): Record<string, string> => {
        const errors: Record<string, string> = {}

        if (!data.name.trim()) {
            errors.name = 'Tên loại ghế là bắt buộc'
        }

        if (data.price <= 0) {
            errors.price = 'Giá phải lớn hơn 0'
        }

        return errors
    }

    const validateEditForm = (data: UpdateTypeSeatRequest): Record<string, string> => {
        const errors: Record<string, string> = {}

        if (!data.name.trim()) {
            errors.name = 'Tên loại ghế là bắt buộc'
        }

        if (data.price <= 0) {
            errors.price = 'Giá phải lớn hơn 0'
        }

        return errors
    }

    // Handle create form submission
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const errors = validateForm(formData)
        setFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            return
        }

        try {
            setIsCreating(true)
            const createResponse = await createTypeSeat(formData)

            if (createResponse.success) {
                // Reset form and refresh data
                setFormData({ name: '', price: 0, isCurrent: false })
                setShowCreateForm(false)

                // Refresh data
                const response = await getAllTypeSeats({
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize
                })

                if (response.success && response.data && response.data.items) {
                    setTypeSeats(response.data.items)
                    setTotalItems(response.data.meta.total || 0)
                }

                alert(createResponse.message || 'Tạo loại ghế thành công!')
            } else {
                alert(createResponse.message || 'Có lỗi xảy ra khi tạo loại ghế')
            }
        } catch (error) {
            console.error('Error creating type seat:', error)
            alert('Có lỗi xảy ra khi tạo loại ghế')
        } finally {
            setIsCreating(false)
        }
    }

    // Handle edit type seat
    const handleEditTypeSeat = (typeSeat: TypeSeat) => {
        setEditingTypeSeat(typeSeat)
        setEditFormData({
            name: typeSeat.name,
            price: typeSeat.price,
            isCurrent: typeSeat.isCurrent
        })
        setEditFormErrors({})
        setShowEditForm(true)
        setShowCreateForm(false) // Close create form if open
    }

    // Handle edit form submission
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editingTypeSeat) return

        const errors = validateEditForm(editFormData)
        setEditFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            return
        }

        try {
            setIsUpdating(true)
            const updateResponse = await updateTypeSeat(editingTypeSeat.id, editFormData)

            if (updateResponse.success) {
                // Reset form and refresh data
                setEditingTypeSeat(null)
                setShowEditForm(false)

                // Refresh data
                const response = await getAllTypeSeats({
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize
                })

                if (response.success && response.data && response.data.items) {
                    setTypeSeats(response.data.items)
                    setTotalItems(response.data.meta.total || 0)
                }

                alert(updateResponse.message || 'Cập nhật loại ghế thành công!')
            } else {
                alert(updateResponse.message || 'Có lỗi xảy ra khi cập nhật loại ghế')
            }
        } catch (error) {
            console.error('Error updating type seat:', error)
            alert('Có lỗi xảy ra khi cập nhật loại ghế')
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle cancel create
    const handleCancelCreate = () => {
        setFormData({ name: '', price: 0, isCurrent: false })
        setFormErrors({})
        setShowCreateForm(false)
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingTypeSeat(null)
        setEditFormData({ name: '', price: 0, isCurrent: false })
        setEditFormErrors({})
        setShowEditForm(false)
    }

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / pageSize)

    // Pagination component
    const PaginationComponent = ({
        currentPage,
        totalPages,
        onPageChange
    }: {
        currentPage: number
        totalPages: number
        onPageChange: (page: number) => void
    }) => {
        if (totalPages <= 1) return null

        const renderPageNumbers = () => {
            const pages = []
            const maxVisiblePages = 5
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1)
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                            i === currentPage
                                ? 'bg-orange-200/70 text-orange-800'
                                : 'text-orange-600 hover:bg-orange-50/40'
                        }`}
                    >
                        {i}
                    </button>
                )
            }
            return pages
        }

        return (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                    Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
                    {Math.min(currentPage * pageSize, totalItems)} trong tổng số {totalItems} kết
                    quả
                </div>
                <div className="flex space-x-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm text-orange-600 hover:bg-orange-50/40 rounded-md disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                        ← Trước
                    </button>
                    {renderPageNumbers()}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm text-orange-600 hover:bg-orange-50/40 rounded-md disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                        Sau →
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand p-6">
            <div className="max-w-7xl mx-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <Card className="bg-surface border-surface">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-primary">Quản lý Loại Ghế</CardTitle>
                                    <CardDescription className="text-secondary">
                                        Quản lý các loại ghế và giá vé trong hệ thống
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={() => setShowCreateForm(true)}
                                    className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                    disabled={showCreateForm || showEditForm}
                                >
                                    Tạo Loại Ghế Mới
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Create Form */}
                    {showCreateForm && (
                        <Card className="bg-surface border-surface">
                            <CardHeader>
                                <CardTitle className="text-primary">Tạo Loại Ghế Mới</CardTitle>
                                <CardDescription className="text-secondary">
                                    Nhập thông tin để tạo loại ghế mới
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Tên loại ghế *
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            name: e.target.value
                                                        }))
                                                    }
                                                    className="input-field"
                                                    placeholder="VD: Ghế VIP"
                                                />
                                                {formErrors.name && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {formErrors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Giá vé *
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1000"
                                                    value={formData.price}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            price: Number(e.target.value)
                                                        }))
                                                    }
                                                    className="input-field"
                                                    placeholder="150000"
                                                />
                                                {formErrors.price && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {formErrors.price}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="isCurrent"
                                                    checked={formData.isCurrent}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            isCurrent: e.target.checked
                                                        }))
                                                    }
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label
                                                    htmlFor="isCurrent"
                                                    className="text-sm font-medium text-primary"
                                                >
                                                    Đang sử dụng
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4">
                                        <Button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={isCreating}
                                        >
                                            {isCreating ? 'Đang tạo...' : 'Tạo Loại Ghế'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancelCreate}
                                            disabled={isCreating}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Edit Form */}
                    {showEditForm && editingTypeSeat && (
                        <Card className="bg-surface border-surface">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    Chỉnh sửa Loại Ghế: {editingTypeSeat.name}
                                </CardTitle>
                                <CardDescription className="text-secondary">
                                    Cập nhật thông tin loại ghế
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleEditSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Tên loại ghế *
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={editFormData.name}
                                                    onChange={(e) =>
                                                        setEditFormData((prev) => ({
                                                            ...prev,
                                                            name: e.target.value
                                                        }))
                                                    }
                                                    className="input-field"
                                                    placeholder="VD: Ghế VIP"
                                                />
                                                {editFormErrors.name && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {editFormErrors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Giá vé *
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1000"
                                                    value={editFormData.price}
                                                    onChange={(e) =>
                                                        setEditFormData((prev) => ({
                                                            ...prev,
                                                            price: Number(e.target.value)
                                                        }))
                                                    }
                                                    className="input-field"
                                                    placeholder="150000"
                                                />
                                                {editFormErrors.price && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {editFormErrors.price}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="editIsCurrent"
                                                    checked={editFormData.isCurrent}
                                                    onChange={(e) =>
                                                        setEditFormData((prev) => ({
                                                            ...prev,
                                                            isCurrent: e.target.checked
                                                        }))
                                                    }
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label
                                                    htmlFor="editIsCurrent"
                                                    className="text-sm font-medium text-primary"
                                                >
                                                    Đang sử dụng
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4">
                                        <Button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancelEdit}
                                            disabled={isUpdating}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Type Seats List */}
                    <Card className="bg-surface border-surface">
                        <CardHeader>
                            <CardTitle className="text-primary">
                                Danh sách Loại Ghế ({totalItems})
                            </CardTitle>
                            <CardDescription className="text-secondary">
                                Tất cả các loại ghế trong hệ thống
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="text-secondary">Đang tải...</div>
                                </div>
                            ) : typeSeats.length === 0 ? (
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
                                                d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h4a1 1 0 0 1 0 2v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 0-2h4z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-primary mb-2">
                                        Chưa có loại ghế nào
                                    </h3>
                                    <p className="text-secondary">
                                        Nhấn "Tạo Loại Ghế Mới" để tạo loại ghế đầu tiên
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {typeSeats.map((typeSeat) => (
                                        <div
                                            key={typeSeat.id}
                                            className="border border-surface rounded-lg p-4 bg-brand/5 hover:bg-brand/10 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-primary">
                                                            {typeSeat.name}
                                                        </h3>
                                                        {typeSeat.isCurrent && (
                                                            <span className="px-3 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200">
                                                                Đang sử dụng
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-secondary">
                                                        <div>
                                                            <span className="font-medium text-primary">
                                                                Giá vé:
                                                            </span>
                                                            <p>
                                                                {typeSeat.price.toLocaleString(
                                                                    'vi-VN'
                                                                )}{' '}
                                                                VNĐ
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-primary">
                                                                Ngày tạo:
                                                            </span>
                                                            <p>
                                                                {new Date(
                                                                    typeSeat.createdAt
                                                                ).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-primary">
                                                                Cập nhật:
                                                            </span>
                                                            <p>
                                                                {new Date(
                                                                    typeSeat.updatedAt
                                                                ).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        onClick={() => handleEditTypeSeat(typeSeat)}
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={showCreateForm || showEditForm}
                                                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                                    >
                                                        Chỉnh sửa
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            <PaginationComponent
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default TypeSeatManageForm
