import type {
    CreateRefreshmentRequest,
    Refreshment,
    UpdateRefreshmentRequest
} from '@/features/super-admin/types/refreshment.types'
import { refreshmentApi } from '@/shared/api/refreshment-api'
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
import { showDeleteConfirm } from '@/shared/utils/confirm'
import {
    createImagePreview,
    revokeImagePreview,
    validateImageFile
} from '@/shared/utils/image-upload'
import { showToast } from '@/shared/utils/toast'
import { useEffect, useRef, useState } from 'react'

interface FormData {
    name: string
    price: number
    picture: File | string
    isCurrent: boolean
}

interface FormErrors {
    name?: string
    price?: string
    picture?: string
}

const initialFormData: FormData = {
    name: '',
    price: 0,
    picture: '',
    isCurrent: true
}

export default function RefreshmentManageForm() {
    const [refreshments, setRefreshments] = useState<Refreshment[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingRefreshment, setEditingRefreshment] = useState<Refreshment | null>(null)

    // Create form state
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [isCreating, setIsCreating] = useState(false)
    const [previewImage, setPreviewImage] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Edit form state
    const [editFormData, setEditFormData] = useState<FormData>(initialFormData)
    const [editFormErrors, setEditFormErrors] = useState<FormErrors>({})
    const [isUpdating, setIsUpdating] = useState(false)
    const [editPreviewImage, setEditPreviewImage] = useState<string>('')
    const editFileInputRef = useRef<HTMLInputElement>(null)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const pageSize = 10

    const fetchRefreshments = async () => {
        try {
            setLoading(true)
            const offset = (currentPage - 1) * pageSize
            const response = await refreshmentApi.getAll({
                limit: pageSize,
                offset
            })
            setRefreshments(response.data.items)
            setTotalItems(response.data.meta.total)
        } catch (error) {
            console.error('Failed to fetch refreshments:', error)
            showToast.error('Failed to load refreshments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRefreshments()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage])

    const validateForm = (data: FormData): FormErrors => {
        const errors: FormErrors = {}

        if (!data.name.trim()) {
            errors.name = 'Refreshment name is required'
        } else if (data.name.length < 2) {
            errors.name = 'Name must be at least 2 characters'
        } else if (data.name.length > 200) {
            errors.name = 'Name must not exceed 200 characters'
        }

        if (data.price < 0) {
            errors.price = 'Price must be a positive number'
        } else if (data.price === 0) {
            errors.price = 'Price is required'
        }

        // Picture validation - can be File or URL string
        if (data.picture) {
            if (typeof data.picture === 'string' && data.picture.trim()) {
                try {
                    new URL(data.picture)
                } catch {
                    errors.picture = 'Invalid URL format'
                }
            }
            // File validation is handled in handleFileSelect
        }

        return errors
    }

    // File upload handlers
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const validation = validateImageFile(file)
        if (!validation.valid) {
            showToast.error(validation.error || 'Invalid file')
            return
        }

        // Store File object directly, not base64
        setFormData((prev) => ({ ...prev, picture: file }))
        setPreviewImage(createImagePreview(file))
    }

    const handleEditFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const validation = validateImageFile(file)
        if (!validation.valid) {
            showToast.error(validation.error || 'Invalid file')
            return
        }

        // Store File object directly, not base64
        setEditFormData((prev) => ({ ...prev, picture: file }))
        setEditPreviewImage(createImagePreview(file))
    }

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            if (previewImage) revokeImagePreview(previewImage)
            if (editPreviewImage) revokeImagePreview(editPreviewImage)
        }
    }, [previewImage, editPreviewImage])

    // Create handlers
    const handleShowCreateForm = () => {
        setShowCreateForm(true)
        setFormData(initialFormData)
        setFormErrors({})
        setPreviewImage('')
    }

    const handleCancelCreate = () => {
        setShowCreateForm(false)
        setFormData(initialFormData)
        setFormErrors({})
        if (previewImage) {
            revokeImagePreview(previewImage)
            setPreviewImage('')
        }
    }

    const handleCreateSubmit = async () => {
        const errors = validateForm(formData)
        setFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            showToast.error('Please fix the validation errors')
            return
        }

        try {
            setIsCreating(true)
            const createData: CreateRefreshmentRequest = {
                name: formData.name.trim(),
                price: formData.price,
                picture: formData.picture, // File object or string, no trim needed
                isCurrent: formData.isCurrent
            }

            await refreshmentApi.create(createData)
            showToast.success('Refreshment created successfully')
            setShowCreateForm(false)
            setFormData(initialFormData)
            fetchRefreshments()
        } catch (error) {
            console.error('Failed to create refreshment:', error)
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Failed to create refreshment'
            showToast.error(errorMessage)
        } finally {
            setIsCreating(false)
        }
    }

    // Edit handlers
    const handleStartEdit = (refreshment: Refreshment) => {
        setEditingRefreshment(refreshment)
        setEditFormData({
            name: refreshment.name,
            price: refreshment.price,
            picture: refreshment.picture,
            isCurrent: refreshment.isCurrent
        })
        setEditFormErrors({})
    }

    const handleCancelEditInline = () => {
        setEditingRefreshment(null)
        setEditFormData(initialFormData)
        setEditFormErrors({})
        if (editPreviewImage) {
            revokeImagePreview(editPreviewImage)
            setEditPreviewImage('')
        }
    }

    const handleSaveEdit = async () => {
        if (!editingRefreshment) return

        console.log('=== BEFORE VALIDATE ===')
        console.log('editFormData.isCurrent:', editFormData.isCurrent)
        console.log('typeof editFormData.isCurrent:', typeof editFormData.isCurrent)

        const errors = validateForm(editFormData)
        setEditFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            showToast.error('Please fix the validation errors')
            return
        }

        try {
            setIsUpdating(true)
            const updateData: UpdateRefreshmentRequest = {
                name: editFormData.name.trim(),
                price: editFormData.price,
                isCurrent: editFormData.isCurrent
            }

            // Only include picture if user uploaded a new file
            if (editFormData.picture instanceof File) {
                updateData.picture = editFormData.picture
            }

            console.log('=== UPDATE DATA TO SEND ===')
            console.log('updateData:', updateData)
            console.log('updateData.isCurrent:', updateData.isCurrent)

            await refreshmentApi.update(editingRefreshment.id, updateData)
            showToast.success('Refreshment updated successfully')
            setEditingRefreshment(null)
            setEditFormData(initialFormData)
            fetchRefreshments()
        } catch (error) {
            console.error('Failed to update refreshment:', error)
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Failed to update refreshment'
            showToast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    // Delete handler
    const handleDelete = (refreshment: Refreshment) => {
        showDeleteConfirm({
            title: 'Delete Refreshment',
            message: `Are you sure you want to delete "${refreshment.name}"?\n\nThis action cannot be undone.`,
            itemName: refreshment.name,
            onConfirm: async () => {
                try {
                    await refreshmentApi.delete(refreshment.id)
                    showToast.success('Refreshment deleted successfully')
                    fetchRefreshments()
                } catch (error) {
                    console.error('Failed to delete refreshment:', error)
                    const errorMessage =
                        (error as { response?: { data?: { message?: string } } })?.response?.data
                            ?.message || 'Failed to delete refreshment'
                    showToast.error(errorMessage)
                }
            }
        })
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const totalPages = Math.ceil(totalItems / pageSize)

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

        return (
            <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-surface text-primary"
                >
                    Previous
                </Button>
                <span className="text-sm text-primary">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-surface text-primary"
                >
                    Next
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="border-surface">
                <CardHeader>
                    <CardTitle className="text-primary">Refreshment Management</CardTitle>
                    <CardDescription className="text-secondary">
                        Manage refreshments Current for purchase
                    </CardDescription>
                    <div className="flex justify-end mt-4">
                        <Button
                            onClick={handleShowCreateForm}
                            disabled={showCreateForm || editingRefreshment !== null}
                            className="btn-primary hover:bg-[#e86d28]"
                        >
                            + New Refreshment
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Refreshments List - Table with Inline Editing */}
            <Card className="border-0">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center">
                            <p className="text-secondary">Loading...</p>
                        </div>
                    ) : refreshments.length === 0 && !showCreateForm ? (
                        <div className="p-8 text-center">
                            <p className="text-secondary">No refreshments yet</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-surface">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px] text-primary">#</TableHead>
                                        <TableHead className="text-primary">Name</TableHead>
                                        <TableHead className="w-[100px] text-primary">
                                            Picture
                                        </TableHead>
                                        <TableHead className="text-primary">Price</TableHead>
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
                                                    placeholder="e.g. Popcorn"
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
                                                <div className="space-y-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={fileInputRef}
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            fileInputRef.current?.click()
                                                        }
                                                        className={
                                                            formErrors.picture
                                                                ? 'border-red-500'
                                                                : ''
                                                        }
                                                        disabled={isCreating}
                                                    >
                                                        Choose Image
                                                    </Button>
                                                    {(previewImage ||
                                                        (typeof formData.picture === 'string' &&
                                                            formData.picture)) && (
                                                        <img
                                                            src={
                                                                previewImage ||
                                                                (typeof formData.picture ===
                                                                'string'
                                                                    ? formData.picture
                                                                    : '')
                                                            }
                                                            alt="Preview"
                                                            className="w-16 h-16 object-cover rounded-md border border-surface"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display =
                                                                    'none'
                                                            }}
                                                        />
                                                    )}
                                                    {formErrors.picture && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {formErrors.picture}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1000"
                                                    placeholder="50000"
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
                                                        Current
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

                                    {/* Refreshment Rows */}
                                    {refreshments.map((refreshment, index) => {
                                        const isEditing = editingRefreshment?.id === refreshment.id

                                        return (
                                            <TableRow
                                                key={refreshment.id}
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
                                                            {refreshment.name}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                ref={editFileInputRef}
                                                                onChange={handleEditFileSelect}
                                                                className="hidden"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    editFileInputRef.current?.click()
                                                                }
                                                                className={
                                                                    editFormErrors.picture
                                                                        ? 'border-red-500'
                                                                        : ''
                                                                }
                                                                disabled={isUpdating}
                                                            >
                                                                Choose Image
                                                            </Button>
                                                            {(editPreviewImage ||
                                                                (typeof editFormData.picture ===
                                                                    'string' &&
                                                                    editFormData.picture)) && (
                                                                <img
                                                                    src={
                                                                        editPreviewImage ||
                                                                        (typeof editFormData.picture ===
                                                                        'string'
                                                                            ? editFormData.picture
                                                                            : '')
                                                                    }
                                                                    alt="Preview"
                                                                    className="w-16 h-16 object-cover rounded-md border border-surface"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display =
                                                                            'none'
                                                                    }}
                                                                />
                                                            )}
                                                            {editFormErrors.picture && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {editFormErrors.picture}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : refreshment.picture ? (
                                                        <img
                                                            src={refreshment.picture}
                                                            alt={refreshment.name}
                                                            className="w-16 h-16 object-cover rounded-md border border-surface"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    'https://via.placeholder.com/64?text=No+Image'
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-secondary text-sm">
                                                            No image
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
                                                            {refreshment.price.toLocaleString(
                                                                'vi-VN'
                                                            )}{' '}
                                                            ₫
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`editIsCurrent-${refreshment.id}`}
                                                                checked={editFormData.isCurrent}
                                                                onCheckedChange={(checked) => {
                                                                    console.log(
                                                                        'Checkbox changed:',
                                                                        checked,
                                                                        typeof checked
                                                                    )
                                                                    setEditFormData((prev) => ({
                                                                        ...prev,
                                                                        isCurrent: checked === true
                                                                    }))
                                                                }}
                                                                disabled={isUpdating}
                                                            />
                                                            <label
                                                                htmlFor={`editIsCurrent-${refreshment.id}`}
                                                                className="text-sm text-primary"
                                                            >
                                                                Current
                                                            </label>
                                                        </div>
                                                    ) : refreshment.isCurrent ? (
                                                        <span className="px-3 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200">
                                                            Current
                                                        </span>
                                                    ) : (
                                                        <span className="text-secondary text-sm">
                                                            UnCurrent
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
                                                        <div className="flex justify-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleStartEdit(refreshment)
                                                                }
                                                                className="border-surface text-primary hover:bg-brand"
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleDelete(refreshment)
                                                                }
                                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                                            >
                                                                Delete
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
