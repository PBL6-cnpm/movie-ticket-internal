import type {
    CreateStaffAccountRequest,
    StaffAccount,
    UpdateStaffAccountRequest
} from '@/features/admin/types/staff-account.types'
import { staffAccountApi } from '@/shared/api/staff-account-api'
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
import { showToast } from '@/shared/utils/toast'
import { useEffect, useState } from 'react'

interface FormData {
    email: string
    password: string
    fullName: string
    phoneNumber: string
    status: string
}

interface FormErrors {
    email?: string
    password?: string
    fullName?: string
    phoneNumber?: string
    status?: string
}

const initialFormData: FormData = {
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    status: 'ACTIVE'
}

export default function StaffAccountManageForm() {
    const [accounts, setAccounts] = useState<StaffAccount[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingAccount, setEditingAccount] = useState<StaffAccount | null>(null)

    // Create form state
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [isCreating, setIsCreating] = useState(false)

    // Edit form state
    const [editFormData, setEditFormData] = useState<FormData>(initialFormData)
    const [editFormErrors, setEditFormErrors] = useState<FormErrors>({})
    const [isUpdating, setIsUpdating] = useState(false)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const pageSize = 10

    const fetchAccounts = async () => {
        try {
            setLoading(true)
            const offset = (currentPage - 1) * pageSize
            const response = await staffAccountApi.getAll({
                limit: pageSize,
                offset
            })
            setAccounts(response.data.items)
            setTotalItems(response.data.meta.total)
        } catch (error) {
            console.error('Failed to fetch staff accounts:', error)
            showToast.error('Failed to load staff accounts')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage])

    // Validation
    const validateForm = (data: FormData): FormErrors => {
        const errors: FormErrors = {}

        if (!data.email.trim()) {
            errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Invalid email format'
        }

        if (!editingAccount && !data.password.trim()) {
            errors.password = 'Password is required'
        } else if (data.password && data.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
        }

        if (!data.fullName.trim()) {
            errors.fullName = 'Full name is required'
        }

        if (!data.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required'
        } else if (!/^[0-9]{10,11}$/.test(data.phoneNumber)) {
            errors.phoneNumber = 'Invalid phone number format'
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
        console.log('FormData before validation:', formData)
        const errors = validateForm(formData)
        console.log('Validation errors:', errors)
        setFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            showToast.error('Please fix the validation errors')
            return
        }

        try {
            setIsCreating(true)
            const createData: CreateStaffAccountRequest = {
                email: formData.email.trim(),
                password: formData.password.trim(),
                fullName: formData.fullName.trim(),
                phoneNumber: formData.phoneNumber.trim()
            }

            await staffAccountApi.create(createData)
            showToast.success('Staff account created successfully')
            setShowCreateForm(false)
            setFormData(initialFormData)
            fetchAccounts()
        } catch (error) {
            console.error('Failed to create staff account:', error)
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Failed to create staff account'
            showToast.error(errorMessage)
        } finally {
            setIsCreating(false)
        }
    }

    // Edit handlers
    const handleStartEdit = (account: StaffAccount) => {
        setEditingAccount(account)
        setEditFormData({
            email: account.email,
            password: '',
            fullName: account.fullName,
            phoneNumber: account.phoneNumber,
            status: account.status
        })
        setEditFormErrors({})
    }

    const handleCancelEditInline = () => {
        setEditingAccount(null)
        setEditFormData(initialFormData)
        setEditFormErrors({})
    }

    const handleSaveEdit = async () => {
        if (!editingAccount) return

        const errors = validateForm(editFormData)
        setEditFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            showToast.error('Please fix the validation errors')
            return
        }

        try {
            setIsUpdating(true)
            const updateData: UpdateStaffAccountRequest = {
                email: editFormData.email.trim(),
                fullName: editFormData.fullName.trim(),
                phoneNumber: editFormData.phoneNumber.trim(),
                status: editFormData.status
            }

            // Only include password if it was changed
            if (editFormData.password.trim()) {
                updateData.password = editFormData.password.trim()
            }

            await staffAccountApi.update(editingAccount.id, updateData)
            showToast.success('Staff account updated successfully')
            setEditingAccount(null)
            setEditFormData(initialFormData)
            fetchAccounts()
        } catch (error) {
            console.error('Failed to update staff account:', error)
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Failed to update staff account'
            showToast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    // Delete handler
    // Removed - No longer needed

    const totalPages = Math.ceil(totalItems / pageSize)

    const isEditing = (accountId: string) => editingAccount?.id === accountId

    return (
        <div className="container mx-auto p-6">
            <Card className="border-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Staff Account Management</CardTitle>
                            <CardDescription>Manage staff accounts and permissions</CardDescription>
                        </div>
                        <Button onClick={handleShowCreateForm} disabled={showCreateForm}>
                            Add New Staff
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
                                        <TableHead className="text-center">Email</TableHead>
                                        <TableHead className="text-center">Password</TableHead>
                                        <TableHead className="text-center">Full Name</TableHead>
                                        <TableHead className="text-center">Phone</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {showCreateForm && (
                                        <TableRow className="bg-accent/50">
                                            <TableCell className="text-center">-</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            email: e.target.value
                                                        })
                                                    }
                                                    className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                        formErrors.email ? 'border-red-500' : ''
                                                    }`}
                                                    autoFocus
                                                    disabled={isCreating}
                                                />
                                                {formErrors.email && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formErrors.email}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="password"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            password: e.target.value
                                                        })
                                                    }
                                                    className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                        formErrors.password ? 'border-red-500' : ''
                                                    }`}
                                                    disabled={isCreating}
                                                />
                                                {formErrors.password && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formErrors.password}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Full Name"
                                                    value={formData.fullName}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            fullName: e.target.value
                                                        })
                                                    }
                                                    className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                        formErrors.fullName ? 'border-red-500' : ''
                                                    }`}
                                                    disabled={isCreating}
                                                />
                                                {formErrors.fullName && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formErrors.fullName}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="0123456789"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            phoneNumber: e.target.value
                                                        })
                                                    }
                                                    className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                        formErrors.phoneNumber
                                                            ? 'border-red-500'
                                                            : ''
                                                    }`}
                                                    disabled={isCreating}
                                                />
                                                {formErrors.phoneNumber && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formErrors.phoneNumber}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="px-3 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200">
                                                    active
                                                </span>
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

                                    {accounts.map((account, index) => (
                                        <TableRow key={account.id}>
                                            <TableCell className="text-center">
                                                {(currentPage - 1) * pageSize + index + 1}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing(account.id) ? (
                                                    <div>
                                                        <Input
                                                            type="email"
                                                            value={editFormData.email}
                                                            onChange={(e) =>
                                                                setEditFormData((prev) => ({
                                                                    ...prev,
                                                                    email: e.target.value
                                                                }))
                                                            }
                                                            className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                                editFormErrors.email
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                            disabled={isUpdating}
                                                        />
                                                        {editFormErrors.email && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {editFormErrors.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    account.email
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing(account.id) ? (
                                                    <div>
                                                        <Input
                                                            type="password"
                                                            placeholder="Leave blank to keep current"
                                                            value={editFormData.password}
                                                            onChange={(e) =>
                                                                setEditFormData((prev) => ({
                                                                    ...prev,
                                                                    password: e.target.value
                                                                }))
                                                            }
                                                            className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                                editFormErrors.password
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                            disabled={isUpdating}
                                                        />
                                                        {editFormErrors.password && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {editFormErrors.password}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">••••••</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing(account.id) ? (
                                                    <div>
                                                        <Input
                                                            value={editFormData.fullName}
                                                            onChange={(e) =>
                                                                setEditFormData((prev) => ({
                                                                    ...prev,
                                                                    fullName: e.target.value
                                                                }))
                                                            }
                                                            className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                                editFormErrors.fullName
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                            disabled={isUpdating}
                                                        />
                                                        {editFormErrors.fullName && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {editFormErrors.fullName}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    account.fullName
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing(account.id) ? (
                                                    <div>
                                                        <Input
                                                            value={editFormData.phoneNumber}
                                                            onChange={(e) =>
                                                                setEditFormData((prev) => ({
                                                                    ...prev,
                                                                    phoneNumber: e.target.value
                                                                }))
                                                            }
                                                            className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                                editFormErrors.phoneNumber
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                            disabled={isUpdating}
                                                        />
                                                        {editFormErrors.phoneNumber && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {editFormErrors.phoneNumber}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    account.phoneNumber
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing(account.id) ? (
                                                    <div>
                                                        <select
                                                            value={editFormData.status}
                                                            onChange={(e) =>
                                                                setEditFormData((prev) => ({
                                                                    ...prev,
                                                                    status: e.target.value
                                                                }))
                                                            }
                                                            className="w-full px-3 py-2 bg-brand border border-surface text-primary rounded-md"
                                                            disabled={isUpdating}
                                                        >
                                                            <option value="active">active</option>
                                                            <option value="deleted">deleted</option>
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                                                            account.status === 'active'
                                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                                : 'bg-red-50 text-red-700 border border-red-200'
                                                        }`}
                                                    >
                                                        {account.status === 'active'
                                                            ? 'active'
                                                            : 'deleted'}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing(account.id) ? (
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
                                                            onClick={() => handleStartEdit(account)}
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

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-surface">
                                    <div className="text-sm text-secondary">
                                        Showing {(currentPage - 1) * pageSize + 1} to{' '}
                                        {Math.min(currentPage * pageSize, totalItems)} of{' '}
                                        {totalItems} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(
                                                    (page) =>
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(page - currentPage) <= 1
                                                )
                                                .map((page, index, array) => (
                                                    <div key={page}>
                                                        {index > 0 &&
                                                            array[index - 1] !== page - 1 && (
                                                                <span className="px-2 text-secondary">
                                                                    ...
                                                                </span>
                                                            )}
                                                        <Button
                                                            variant={
                                                                currentPage === page
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            size="sm"
                                                            onClick={() => setCurrentPage(page)}
                                                        >
                                                            {page}
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
