import { typeDayApi } from '@/shared/api/type-day-api'
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
import type { TypeDay, UpdateTypeDayRequest } from '@/shared/types/type-day/type-day.types'
import { showToast } from '@/shared/utils/toast'
import { useEffect, useState } from 'react'

interface FormData {
    additionalPrice: number
}

interface FormErrors {
    additionalPrice?: string
}

const initialFormData: FormData = {
    additionalPrice: 0
}

// Map dayOfWeek number to Vietnamese day name
const getDayName = (dayOfWeek: number): string => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
    return days[dayOfWeek] || 'Unknown'
}

// Format currency to VND
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

export default function TypeDayManageForm() {
    const [typeDays, setTypeDays] = useState<TypeDay[]>([])
    const [loading, setLoading] = useState(true)
    const [editingTypeDay, setEditingTypeDay] = useState<TypeDay | null>(null)

    // Edit form state
    const [editFormData, setEditFormData] = useState<FormData>(initialFormData)
    const [editFormErrors, setEditFormErrors] = useState<FormErrors>({})
    const [isUpdating, setIsUpdating] = useState(false)

    const fetchTypeDays = async () => {
        try {
            setLoading(true)
            const response = await typeDayApi.getAll()
            // Sort by dayOfWeek (Sunday = 0 first, then Monday = 1, etc.)
            const sortedData = response.data.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
            setTypeDays(sortedData)
        } catch (error) {
            console.error('Failed to fetch type days:', error)
            showToast.error('Failed to load type days')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTypeDays()
    }, [])

    // Validation
    const validateForm = (data: FormData): FormErrors => {
        const errors: FormErrors = {}

        if (data.additionalPrice < 0) {
            errors.additionalPrice = 'Additional price must be greater than or equal to 0'
        }

        return errors
    }

    // Edit handlers
    const handleStartEdit = (typeDay: TypeDay) => {
        setEditingTypeDay(typeDay)
        setEditFormData({
            additionalPrice: typeDay.additionalPrice
        })
        setEditFormErrors({})
    }

    const handleCancelEditInline = () => {
        setEditingTypeDay(null)
        setEditFormData(initialFormData)
        setEditFormErrors({})
    }

    const handleSaveEdit = async () => {
        if (!editingTypeDay) return

        const errors = validateForm(editFormData)
        setEditFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            showToast.error('Please fix the validation errors')
            return
        }

        try {
            setIsUpdating(true)
            const updateData: UpdateTypeDayRequest = {
                additionalPrice: editFormData.additionalPrice
            }

            await typeDayApi.update(editingTypeDay.id, updateData)
            showToast.success('Type day updated successfully')
            setEditingTypeDay(null)
            setEditFormData(initialFormData)
            fetchTypeDays()
        } catch (error) {
            console.error('Failed to update type day:', error)
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Failed to update type day'
            showToast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    const isEditing = (typeDayId: string) => editingTypeDay?.id === typeDayId

    return (
        <div className="container mx-auto p-6">
            <Card className="border-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Type Day Management</CardTitle>
                            <CardDescription>
                                Manage additional prices for each day of the week
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-secondary">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">#</TableHead>
                                    <TableHead className="text-center">Day of Week</TableHead>
                                    <TableHead className="text-center">Additional Price</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {typeDays.map((typeDay, index) => (
                                    <TableRow key={typeDay.id}>
                                        <TableCell className="text-center">{index + 1}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="font-medium">
                                                {getDayName(typeDay.dayOfWeek)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isEditing(typeDay.id) ? (
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
                                                        typeDay.additionalPrice > 0
                                                            ? 'text-green-600'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    {formatCurrency(typeDay.additionalPrice)}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isEditing(typeDay.id) ? (
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
                                                        onClick={() => handleStartEdit(typeDay)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
