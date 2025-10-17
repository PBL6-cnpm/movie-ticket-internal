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
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/components/ui/table'
import { showToast } from '@/shared/utils/toast'
import React, { useEffect, useState } from 'react'

const TypeSeatManageForm: React.FC = () => {
    const [typeSeats, setTypeSeats] = useState<TypeSeat[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false)

    // Edit states - inline editing in table
    const [editingTypeSeat, setEditingTypeSeat] = useState<TypeSeat | null>(null)
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
            errors.name = 'Seat type name is required'
        }

        if (data.price <= 0) {
            errors.price = 'Price must be greater than 0'
        }

        return errors
    }

    const validateEditForm = (data: UpdateTypeSeatRequest): Record<string, string> => {
        const errors: Record<string, string> = {}

        if (!data.name.trim()) {
            errors.name = 'Seat type name is required'
        }

        if (data.price <= 0) {
            errors.price = 'Price must be greater than 0'
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

                showToast.success(createResponse.message || 'Seat type created successfully!')
            } else {
                showToast.error(
                    createResponse.message || 'An error occurred while creating seat type'
                )
            }
        } catch (error) {
            console.error('Error creating type seat:', error)
            showToast.error('An error occurred while creating seat type')
        } finally {
            setIsCreating(false)
        }
    }

    // Handle start editing type seat (inline)
    const handleStartEdit = (typeSeat: TypeSeat) => {
        setEditingTypeSeat(typeSeat)
        setEditFormData({
            name: typeSeat.name,
            price: typeSeat.price,
            isCurrent: typeSeat.isCurrent
        })
        setEditFormErrors({})
        setShowCreateForm(false) // Close create form if open
    }

    // Handle cancel edit
    const handleCancelEditInline = () => {
        setEditingTypeSeat(null)
        setEditFormData({ name: '', price: 0, isCurrent: false })
        setEditFormErrors({})
    }

    // Handle save edited type seat (inline)
    const handleSaveEdit = async () => {
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
                // Update local state
                setTypeSeats((prev) =>
                    prev.map((item) =>
                        item.id === editingTypeSeat.id ? { ...item, ...editFormData } : item
                    )
                )

                // Reset editing state
                setEditingTypeSeat(null)
                setEditFormData({ name: '', price: 0, isCurrent: false })
                setEditFormErrors({})

                showToast.success(updateResponse.message || 'Seat type updated successfully!')
            } else {
                showToast.error(
                    updateResponse.message || 'An error occurred while updating seat type'
                )
            }
        } catch (error) {
            console.error('Error updating type seat:', error)
            showToast.error('An error occurred while updating seat type')
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
                    Showing {(currentPage - 1) * pageSize + 1} -{' '}
                    {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                </div>
                <div className="flex space-x-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm text-orange-600 hover:bg-orange-50/40 rounded-md disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                        ← Previous
                    </button>
                    {renderPageNumbers()}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm text-orange-600 hover:bg-orange-50/40 rounded-md disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                        Next →
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-primary">Seat Type Management</CardTitle>
                            <CardDescription className="text-secondary">
                                Manage seat types and ticket prices in the system
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                            disabled={showCreateForm || editingTypeSeat !== null}
                        >
                            + New Seat Type
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Type Seats List - Table with Inline Editing */}
            <Card className="border-0">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center">
                            <p className="text-secondary">Loading...</p>
                        </div>
                    ) : typeSeats.length === 0 && !showCreateForm ? (
                        <div className="p-8 text-center">
                            <p className="text-secondary">No seat types yet</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-surface">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px] text-primary">#</TableHead>
                                        <TableHead className="text-primary">
                                            Seat Type Name
                                        </TableHead>
                                        <TableHead className="text-primary">
                                            Ticket Price (VND)
                                        </TableHead>
                                        <TableHead className="text-primary">Status</TableHead>
                                        <TableHead className="w-[200px] text-center text-primary">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* Create Form Row */}
                                    {showCreateForm && (
                                        <TableRow>
                                            <TableCell className="font-medium text-primary">
                                                New
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g. VIP Seat"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            name: e.target.value
                                                        }))
                                                    }
                                                    className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                        formErrors.name ? 'border-red-500' : ''
                                                    }`}
                                                    autoFocus
                                                    disabled={isCreating}
                                                />
                                                {formErrors.name && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formErrors.name}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1000"
                                                    placeholder="150000"
                                                    value={formData.price}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            price: Number(e.target.value)
                                                        }))
                                                    }
                                                    className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                        formErrors.price ? 'border-red-500' : ''
                                                    }`}
                                                    disabled={isCreating}
                                                />
                                                {formErrors.price && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formErrors.price}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="createIsCurrent"
                                                        checked={formData.isCurrent}
                                                        onCheckedChange={(checked) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                isCurrent: checked === true
                                                            }))
                                                        }
                                                        disabled={isCreating}
                                                    />
                                                    <label
                                                        htmlFor="createIsCurrent"
                                                        className="text-sm text-primary"
                                                    >
                                                        Currently Active
                                                    </label>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={handleCreateSubmit}
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
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Type Seat Rows */}
                                    {typeSeats.map((typeSeat, index) => {
                                        const isEditing = editingTypeSeat?.id === typeSeat.id

                                        return (
                                            <TableRow
                                                key={typeSeat.id}
                                                className="border-surface hover:bg-brand/10"
                                            >
                                                <TableCell className="font-medium text-primary">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <>
                                                            <Input
                                                                type="text"
                                                                value={editFormData.name}
                                                                onChange={(e) =>
                                                                    setEditFormData((prev) => ({
                                                                        ...prev,
                                                                        name: e.target.value
                                                                    }))
                                                                }
                                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                                    editFormErrors.name
                                                                        ? 'border-red-500'
                                                                        : ''
                                                                }`}
                                                                disabled={isUpdating}
                                                            />
                                                            {editFormErrors.name && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {editFormErrors.name}
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-primary font-medium">
                                                            {typeSeat.name}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="1000"
                                                                value={editFormData.price}
                                                                onChange={(e) =>
                                                                    setEditFormData((prev) => ({
                                                                        ...prev,
                                                                        price: Number(
                                                                            e.target.value
                                                                        )
                                                                    }))
                                                                }
                                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                                    editFormErrors.price
                                                                        ? 'border-red-500'
                                                                        : ''
                                                                }`}
                                                                disabled={isUpdating}
                                                            />
                                                            {editFormErrors.price && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {editFormErrors.price}
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-primary">
                                                            {typeSeat.price.toLocaleString('vi-VN')}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`editIsCurrent-${typeSeat.id}`}
                                                                checked={editFormData.isCurrent}
                                                                onCheckedChange={(checked) =>
                                                                    setEditFormData((prev) => ({
                                                                        ...prev,
                                                                        isCurrent: checked === true
                                                                    }))
                                                                }
                                                                disabled={isUpdating}
                                                            />
                                                            <label
                                                                htmlFor={`editIsCurrent-${typeSeat.id}`}
                                                                className="text-sm text-primary"
                                                            >
                                                                Currently Active
                                                            </label>
                                                        </div>
                                                    ) : typeSeat.isCurrent ? (
                                                        <span className="px-3 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200">
                                                            Currently Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-secondary text-sm">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <div className="flex justify-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={handleSaveEdit}
                                                                disabled={isUpdating}
                                                                className="btn-primary hover:bg-[#e86d28]"
                                                            >
                                                                {isUpdating ? '...' : '✓'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleCancelEditInline}
                                                                disabled={isUpdating}
                                                                className="border-surface text-secondary"
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-center">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleStartEdit(typeSeat)
                                                                }
                                                                className="border-surface text-primary hover:bg-brand"
                                                            >
                                                                Edit
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

                    {/* Pagination */}
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default TypeSeatManageForm
