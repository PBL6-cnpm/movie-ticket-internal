import { specialDateApi } from '@/shared/api/special-date-api'
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
import type {
    CreateSpecialDateRequest,
    SpecialDate,
    UpdateSpecialDateRequest
} from '@/shared/types/special-day/special-date.types'
import { showDeleteConfirm } from '@/shared/utils/confirm'
import { showToast } from '@/shared/utils/toast'
import { useEffect, useState } from 'react'

interface FormData {
    date: string
    additionalPrice: number
}

interface FormErrors {
    date?: string
    additionalPrice?: string
}

const initialFormData: FormData = {
    date: '',
    additionalPrice: 0
}

// Format date to display format (DD/MM/YYYY)
const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

// Format currency to VND
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

// Convert date string to input date format (YYYY-MM-DD)
const toInputDateFormat = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export default function SpecialDateManageForm() {
    const [specialDates, setSpecialDates] = useState<SpecialDate[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingSpecialDate, setEditingSpecialDate] = useState<SpecialDate | null>(null)

    // Create form state
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [isCreating, setIsCreating] = useState(false)

    // Edit form state
    const [editFormData, setEditFormData] = useState<FormData>(initialFormData)
    const [editFormErrors, setEditFormErrors] = useState<FormErrors>({})
    const [isUpdating, setIsUpdating] = useState(false)

    const fetchSpecialDates = async () => {
        try {
            setLoading(true)
            const response = await specialDateApi.getAll()
            // Sort by date (earliest first)
            const sortedData = response.data.sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            setSpecialDates(sortedData)
        } catch (error) {
            console.error('Failed to fetch special dates:', error)
            showToast.error('Failed to load special dates')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSpecialDates()
    }, [])

    // Validation
    const validateForm = (data: FormData, isEdit: boolean = false): FormErrors => {
        const errors: FormErrors = {}

        if (!isEdit && !data.date) {
            errors.date = 'Date is required'
        }

        if (data.additionalPrice < 0) {
            errors.additionalPrice = 'Additional price must be greater than or equal to 0'
        }

        return errors
    }

    // Create handlers
    const handleShowCreateForm = () => {
        setShowCreateForm(true)
        setFormData(initialFormData)
        setFormErrors({})
    }

    const handleCancelCreate = () => {
        setShowCreateForm(false)
        setFormData(initialFormData)
        setFormErrors({})
    }

    const handleCreate = async () => {
        const errors = validateForm(formData)
        setFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            showToast.error('Please fix the validation errors')
            return
        }

        try {
            setIsCreating(true)
            // Convert date to ISO string in UTC
            // Input format is YYYY-MM-DD, we need to create UTC date at midnight
            const [year, month, day] = formData.date.split('-').map(Number)
            const selectedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))

            const createData: CreateSpecialDateRequest = {
                date: selectedDate.toISOString(),
                additionalPrice: formData.additionalPrice
            }

            await specialDateApi.create(createData)
            showToast.success('Special date created successfully')
            setShowCreateForm(false)
            setFormData(initialFormData)
            fetchSpecialDates()
        } catch (error) {
            console.error('Failed to create special date:', error)
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Failed to create special date'
            showToast.error(errorMessage)
        } finally {
            setIsCreating(false)
        }
    }

    // Edit handlers
    const handleStartEdit = (specialDate: SpecialDate) => {
        setEditingSpecialDate(specialDate)
        setEditFormData({
            date: toInputDateFormat(specialDate.date),
            additionalPrice: specialDate.additionalPrice
        })
        setEditFormErrors({})
    }

    const handleCancelEditInline = () => {
        setEditingSpecialDate(null)
        setEditFormData(initialFormData)
        setEditFormErrors({})
    }

    const handleSaveEdit = async () => {
        if (!editingSpecialDate) return

        const errors = validateForm(editFormData, true)
        setEditFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            showToast.error('Please fix the validation errors')
            return
        }

        try {
            setIsUpdating(true)
            const updateData: UpdateSpecialDateRequest = {
                additionalPrice: editFormData.additionalPrice
            }

            await specialDateApi.update(editingSpecialDate.id, updateData)
            showToast.success('Special date updated successfully')
            setEditingSpecialDate(null)
            setEditFormData(initialFormData)
            fetchSpecialDates()
        } catch (error) {
            console.error('Failed to update special date:', error)
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Failed to update special date'
            showToast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    // Delete handler
    const handleDelete = (id: string, date: string) => {
        showDeleteConfirm({
            title: 'Delete Special Date',
            itemName: formatDate(date),
            message: 'This special date will be permanently deleted.',
            onConfirm: async () => {
                try {
                    await specialDateApi.delete(id)
                    showToast.success('Special date deleted successfully')
                    fetchSpecialDates()
                } catch (error) {
                    console.error('Failed to delete special date:', error)
                    const errorMessage =
                        (error as { response?: { data?: { message?: string } } })?.response?.data
                            ?.message || 'Failed to delete special date'
                    showToast.error(errorMessage)
                }
            }
        })
    }

    const isEditing = (specialDateId: string) => editingSpecialDate?.id === specialDateId

    return (
        <div className="container mx-auto p-6">
            <Card className="border-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Special Date Management</CardTitle>
                            <CardDescription>
                                Manage additional prices for special dates (holidays, events)
                            </CardDescription>
                        </div>
                        <Button onClick={handleShowCreateForm} disabled={showCreateForm}>
                            Add Special Date
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-secondary">Loading...</div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center">#</TableHead>
                                        <TableHead className="text-center">Date</TableHead>
                                        <TableHead className="text-center">
                                            Additional Price
                                        </TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {showCreateForm && (
                                        <TableRow className="bg-accent/50">
                                            <TableCell className="text-center">-</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            date: e.target.value
                                                        })
                                                    }
                                                    className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                        formErrors.date ? 'border-red-500' : ''
                                                    }`}
                                                    autoFocus
                                                    disabled={isCreating}
                                                />
                                                {formErrors.date && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formErrors.date}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1000"
                                                    placeholder="Additional price"
                                                    value={formData.additionalPrice}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            additionalPrice: Number(e.target.value)
                                                        })
                                                    }
                                                    className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                        formErrors.additionalPrice
                                                            ? 'border-red-500'
                                                            : ''
                                                    }`}
                                                    disabled={isCreating}
                                                />
                                                {formErrors.additionalPrice && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formErrors.additionalPrice}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={handleCreate}
                                                        disabled={isCreating}
                                                    >
                                                        {isCreating ? 'Saving...' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleCancelCreate}
                                                        disabled={isCreating}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {specialDates.map((specialDate, index) => (
                                        <TableRow key={specialDate.id}>
                                            <TableCell className="text-center">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-medium">
                                                    {formatDate(specialDate.date)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing(specialDate.id) ? (
                                                    <div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="1000"
                                                            value={editFormData.additionalPrice}
                                                            onChange={(e) =>
                                                                setEditFormData((prev) => ({
                                                                    ...prev,
                                                                    additionalPrice: Number(
                                                                        e.target.value
                                                                    )
                                                                }))
                                                            }
                                                            className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                                editFormErrors.additionalPrice
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                            disabled={isUpdating}
                                                        />
                                                        {editFormErrors.additionalPrice && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {editFormErrors.additionalPrice}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`font-semibold ${
                                                            specialDate.additionalPrice > 0
                                                                ? 'text-green-600'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {formatCurrency(
                                                            specialDate.additionalPrice
                                                        )}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing(specialDate.id) ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={handleSaveEdit}
                                                            disabled={isUpdating}
                                                        >
                                                            {isUpdating ? 'Saving...' : 'Save'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleCancelEditInline}
                                                            disabled={isUpdating}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleStartEdit(specialDate)
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    specialDate.id,
                                                                    specialDate.date
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {specialDates.length === 0 && !showCreateForm && (
                                <div className="p-8 text-center text-secondary">
                                    No special dates found. Click "Add Special Date" to create one.
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
