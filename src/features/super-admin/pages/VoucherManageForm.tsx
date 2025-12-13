import type {
    CreateVoucherRequest,
    UpdateVoucherRequest,
    Voucher
} from '@/features/super-admin/types/voucher.types'
import { voucherApi } from '@/shared/api/voucher-api'
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
import Label from '@/shared/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/shared/components/ui/select'
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
import { Edit2, Loader2, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface FormData {
    name: string
    code: string
    number: number
    discountPercent: number | null
    maxDiscountValue: number | null
    discountValue: number | null
    minimumOrderValue: number | null
    validFrom: string
    validTo: string
    isPrivate: boolean
}

interface FormErrors {
    name?: string
    code?: string
    number?: string
    discountPercent?: string
    maxDiscountValue?: string
    discountValue?: string
    minimumOrderValue?: string
    validFrom?: string
    validTo?: string
}

const initialFormData: FormData = {
    name: '',
    code: '',
    number: 0,
    discountPercent: null,
    maxDiscountValue: null,
    discountValue: null,
    minimumOrderValue: null,
    validFrom: '',
    validTo: '',
    isPrivate: false
}

export default function VoucherManageForm() {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
    const [filterType, setFilterType] = useState<string>('all')

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalVouchers, setTotalVouchers] = useState(0)
    const pageSize = 10

    // Create form state
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [isCreating, setIsCreating] = useState(false)

    // Edit form state
    const [editFormData, setEditFormData] = useState<FormData>(initialFormData)
    const [editFormErrors, setEditFormErrors] = useState<FormErrors>({})
    const [isUpdating, setIsUpdating] = useState(false)

    // Dropdown state
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    // Search state
    const [searchKeyword, setSearchKeyword] = useState('')
    const [searchValidFromStart, setSearchValidFromStart] = useState('')
    const [searchValidToEnd, setSearchValidToEnd] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    const fetchVouchers = useCallback(async () => {
        try {
            setLoading(true)

            // Use search API if any search criteria is active
            if (isSearching) {
                // Calculate isPrivate param from filterType
                const isPrivateParam = filterType === 'all' ? undefined : filterType === 'private'

                const response = await voucherApi.search({
                    keyword: searchKeyword || undefined,
                    isPrivate: isPrivateParam,
                    validFromStart: searchValidFromStart || undefined,
                    validToEnd: searchValidToEnd || undefined,
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize
                })

                setVouchers(response.data.items)
                setTotalVouchers(response.data.meta.total)
            } else {
                // Use getAll without filter (backend returns all vouchers)
                const response = await voucherApi.getAll({
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize
                })

                setVouchers(response.data.items)
                setTotalVouchers(response.data.meta.total)
            }
        } catch (error: unknown) {
            console.error('Failed to fetch vouchers:', error)

            // Handle error from API interceptor
            if (error && typeof error === 'object') {
                const apiError = error as {
                    success?: boolean
                    statusCode?: number
                    message?: string
                }

                const errorMessage =
                    apiError.message || 'Failed to load vouchers. Please try again.'
                showToast.error(errorMessage)
            } else if (error instanceof Error) {
                showToast.error(error.message || 'Failed to load vouchers')
            } else {
                showToast.error('Failed to load vouchers')
            }
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, isSearching])

    useEffect(() => {
        fetchVouchers()
    }, [fetchVouchers])

    useEffect(() => {
        // Handle click outside dropdown
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.dropdown-container')) {
                setActiveDropdown(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const validateForm = (data: FormData): FormErrors => {
        const errors: FormErrors = {}

        if (!data.name.trim()) {
            errors.name = 'Name is required'
        }

        if (!data.code.trim()) {
            errors.code = 'Code is required'
        }

        if (data.number < 0) {
            errors.number = 'Number must be greater than or equal to 0'
        }

        if (
            data.discountPercent !== null &&
            (data.discountPercent < 0 || data.discountPercent > 100)
        ) {
            errors.discountPercent = 'Discount percent must be between 0 and 100'
        }

        if (data.maxDiscountValue !== null && data.maxDiscountValue < 0) {
            errors.maxDiscountValue = 'Max discount value must be greater than or equal to 0'
        }

        if (data.discountValue !== null && data.discountValue < 0) {
            errors.discountValue = 'Discount value must be greater than or equal to 0'
        }

        if (data.minimumOrderValue !== null && data.minimumOrderValue < 0) {
            errors.minimumOrderValue = 'Minimum order value must be greater than or equal to 0'
        }

        if (data.validFrom && data.validTo && new Date(data.validFrom) > new Date(data.validTo)) {
            errors.validTo = 'Valid to must be after valid from'
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

    const handleCreateSubmit = async () => {
        const errors = validateForm(formData)
        setFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            showToast.error('Please fix the validation errors')
            return
        }

        try {
            setIsCreating(true)
            const createData: CreateVoucherRequest = {
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                number: formData.number,
                discountPercent: formData.discountPercent,
                maxDiscountValue: formData.maxDiscountValue,
                discountValue: formData.discountValue,
                minimumOrderValue: formData.minimumOrderValue,
                validFrom: formData.validFrom || null,
                validTo: formData.validTo || null,
                isPrivate: formData.isPrivate
            }

            await voucherApi.create(createData)
            showToast.success('Voucher created successfully')
            setShowCreateForm(false)
            setFormData(initialFormData)
            fetchVouchers()
        } catch (error: unknown) {
            console.error('Failed to create voucher:', error)

            // Handle error from API interceptor
            if (error && typeof error === 'object') {
                const apiError = error as {
                    success?: boolean
                    statusCode?: number
                    message?: string
                }

                const errorMessage =
                    apiError.message || 'Failed to create voucher. Please try again.'
                showToast.error(errorMessage)
            } else if (error instanceof Error) {
                showToast.error(error.message || 'Failed to create voucher')
            } else {
                showToast.error('Failed to create voucher')
            }
        } finally {
            setIsCreating(false)
        }
    }

    // Edit handlers
    const handleStartEdit = (voucher: Voucher) => {
        console.log('🔧 Starting edit for voucher:', voucher.id, voucher)
        setEditingVoucher(voucher)
        console.log('✅ Set editingVoucher to:', voucher)
        setEditFormData({
            name: voucher.name,
            code: voucher.code,
            number: voucher.number,
            discountPercent: voucher.discountPercent,
            maxDiscountValue: voucher.maxDiscountValue,
            discountValue: voucher.discountValue,
            minimumOrderValue: voucher.minimumOrderValue,
            validFrom: voucher.validFrom
                ? new Date(voucher.validFrom).toISOString().slice(0, 16)
                : '',
            validTo: voucher.validTo ? new Date(voucher.validTo).toISOString().slice(0, 16) : '',
            isPrivate: voucher.isPrivate
        })
        setEditFormErrors({})
        setActiveDropdown(null)
        console.log('📝 Edit mode should be active now')
    }

    const handleCancelEditInline = () => {
        setEditingVoucher(null)
        setEditFormData(initialFormData)
        setEditFormErrors({})
    }

    const handleSaveEdit = async () => {
        if (!editingVoucher) return

        const errors = validateForm(editFormData)
        setEditFormErrors(errors)

        if (Object.keys(errors).length > 0) {
            showToast.error('Please fix the validation errors')
            return
        }

        try {
            setIsUpdating(true)
            const updateData: UpdateVoucherRequest = {
                name: editFormData.name.trim(),
                code: editFormData.code.trim().toUpperCase(),
                number: editFormData.number,
                discountPercent: editFormData.discountPercent,
                maxDiscountValue: editFormData.maxDiscountValue,
                discountValue: editFormData.discountValue,
                minimumOrderValue: editFormData.minimumOrderValue,
                validFrom: editFormData.validFrom || null,
                validTo: editFormData.validTo || null,
                isPrivate: editFormData.isPrivate
            }

            await voucherApi.update(editingVoucher.id, updateData)
            showToast.success('Voucher updated successfully')
            setEditingVoucher(null)
            fetchVouchers()
        } catch (error: unknown) {
            console.error('Failed to update voucher:', error)

            // Handle error from API interceptor
            if (error && typeof error === 'object') {
                const apiError = error as {
                    success?: boolean
                    statusCode?: number
                    message?: string
                }

                const errorMessage =
                    apiError.message || 'Failed to update voucher. Please try again.'
                showToast.error(errorMessage)
            } else if (error instanceof Error) {
                showToast.error(error.message || 'Failed to update voucher')
            } else {
                showToast.error('Failed to update voucher')
            }
        } finally {
            setIsUpdating(false)
        }
    }

    // Delete handler
    const handleDelete = (id: string, name: string) => {
        setActiveDropdown(null)
        showDeleteConfirm({
            title: 'Delete Voucher',
            message: `Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`,
            itemName: name,
            onConfirm: async () => {
                try {
                    await voucherApi.delete(id)
                    showToast.success('Voucher deleted successfully')
                    fetchVouchers()
                } catch (error: unknown) {
                    console.error('Failed to delete voucher:', error)

                    // Handle error from API interceptor
                    if (error && typeof error === 'object') {
                        const apiError = error as {
                            success?: boolean
                            statusCode?: number
                            message?: string
                        }

                        const errorMessage =
                            apiError.message || 'Failed to delete voucher. Please try again.'
                        showToast.error(errorMessage)
                    } else if (error instanceof Error) {
                        showToast.error(error.message || 'Failed to delete voucher')
                    } else {
                        showToast.error('Failed to delete voucher')
                    }
                }
            }
        })
    }

    // Search handlers
    const handleSearch = () => {
        setCurrentPage(1) // Reset to first page when searching
        setIsSearching(true) // Trigger useEffect to fetch
    }

    const handleClearSearch = () => {
        setSearchKeyword('')
        setSearchValidFromStart('')
        setSearchValidToEnd('')
        setFilterType('all')
        setIsSearching(false)
        setCurrentPage(1)
    }

    const formatCurrency = (value: number | null) => {
        if (value === null) return 'N/A'
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value)
    }

    const formatDate = (date: string | null) => {
        if (!date) return ''
        // Parse the date string directly without timezone conversion
        const d = new Date(date)
        const year = d.getUTCFullYear()
        const month = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        const hours = String(d.getUTCHours()).padStart(2, '0')
        const minutes = String(d.getUTCMinutes()).padStart(2, '0')
        return `${day}/${month}/${year} ${hours}:${minutes}`
    }

    const totalPages = Math.ceil(totalVouchers / pageSize)

    // Generate smart pagination numbers
    const generatePaginationNumbers = () => {
        const delta = 2
        const range = []
        const rangeWithDots = []

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i)
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...')
        } else {
            rangeWithDots.push(1)
        }

        rangeWithDots.push(...range)

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages)
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages)
        }

        return rangeWithDots.filter((item, index, arr) => {
            if (typeof item === 'number') {
                return arr.indexOf(item) === index
            }
            return true
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[#e86d28]" />
                <span className="ml-2">Loading vouchers...</span>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">Voucher Management</CardTitle>
                            <CardDescription>Manage vouchers for the system</CardDescription>
                        </div>
                        <Button onClick={handleShowCreateForm} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Voucher
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search Section */}
                    <Card className="mb-6 bg-[#1a2232] dark:bg-gray-800 overflow-visible">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Search Vouchers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-visible">
                            <div className="space-y-4 overflow-visible">
                                <div className="flex flex-col lg:flex-row gap-3 lg:items-start overflow-visible">
                                    {/* Keyword Search */}
                                    <div className="w-full lg:flex-1 lg:min-w-[160px]">
                                        <Label
                                            htmlFor="searchKeyword"
                                            className="text-sm mb-1.5 block"
                                        >
                                            Keyword
                                        </Label>
                                        <Input
                                            id="searchKeyword"
                                            placeholder="Code or name..."
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch()
                                                }
                                            }}
                                            className="h-10"
                                        />
                                    </div>

                                    {/* Valid From */}
                                    <div className="w-full lg:w-[250px] relative z-[50]">
                                        <Label
                                            htmlFor="searchValidFromStart"
                                            className="text-sm mb-1.5 block"
                                        >
                                            Valid From
                                        </Label>
                                        <Input
                                            id="searchValidFromStart"
                                            type="datetime-local"
                                            value={searchValidFromStart}
                                            onChange={(e) =>
                                                setSearchValidFromStart(e.target.value)
                                            }
                                            className="h-10 w-full"
                                        />
                                    </div>

                                    {/* Valid To */}
                                    <div className="w-full lg:w-[250px] relative z-[50]">
                                        <Label
                                            htmlFor="searchValidToEnd"
                                            className="text-sm mb-1.5 block"
                                        >
                                            Valid To
                                        </Label>
                                        <Input
                                            id="searchValidToEnd"
                                            type="datetime-local"
                                            value={searchValidToEnd}
                                            onChange={(e) => setSearchValidToEnd(e.target.value)}
                                            className="h-10 w-full"
                                        />
                                    </div>

                                    {/* Type Filter */}
                                    <div className="w-full lg:w-[150px]">
                                        <Label
                                            htmlFor="searchType"
                                            className="text-sm mb-1.5 block"
                                        >
                                            Type
                                        </Label>
                                        <Select value={filterType} onValueChange={setFilterType}>
                                            <SelectTrigger id="searchType" className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent
                                                className="bg-[#1a2232] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg z-[100] min-w-[200px] p-1 max-h-[200px]
    overflow-y-auto"
                                            >
                                                <SelectItem
                                                    value="all"
                                                    className="px-3 py-2.5 my-0.5 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-orange-50 dark:focus:bg-orange-900/30 focus:text-[#e86d28] dark:focus:text-orange-300 data-[state=checked]:bg-[#e86d28] data-[state=checked]:text-white dark:data-[state=checked]:bg-[#d35f1a] font-medium"
                                                >
                                                    All Vouchers
                                                </SelectItem>
                                                <SelectItem
                                                    value="public"
                                                    className="px-3 py-2.5 my-0.5 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-orange-50 dark:focus:bg-orange-900/30 focus:text-[#e86d28] dark:focus:text-orange-300 data-[state=checked]:bg-[#e86d28] data-[state=checked]:text-white dark:data-[state=checked]:bg-[#d35f1a] font-medium"
                                                >
                                                    Public Vouchers
                                                </SelectItem>
                                                <SelectItem
                                                    value="private"
                                                    className="px-3 py-2.5 my-0.5 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-orange-50 dark:focus:bg-orange-900/30 focus:text-[#e86d28] dark:focus:text-orange-300 data-[state=checked]:bg-[#e86d28] data-[state=checked]:text-white dark:data-[state=checked]:bg-[#d35f1a] font-medium"
                                                >
                                                    Private Vouchers
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Spacer */}
                                    <div className="hidden lg:block lg:flex-1"></div>

                                    {/* Action Buttons */}
                                    <div className="w-full lg:w-auto flex gap-2 lg:self-start lg:mt-[26px] lg:ml-2">
                                        <Button
                                            onClick={handleSearch}
                                            className="flex items-center justify-center gap-2 h-10 flex-1 lg:flex-initial lg:w-[120px]"
                                        >
                                            <Search className="h-4 w-4" />
                                            Search
                                        </Button>
                                        <Button
                                            onClick={handleClearSearch}
                                            variant="outline"
                                            className="flex items-center justify-center gap-2 h-10 flex-1 lg:flex-initial lg:w-[120px]"
                                        >
                                            <X className="h-4 w-4" />
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Create Form */}
                    {showCreateForm && (
                        <Card className="mb-6 border-2 border-primary">
                            <CardHeader>
                                <CardTitle>Create New Voucher</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            className={formErrors.name ? 'border-red-500' : ''}
                                        />
                                        {formErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="code">Code *</Label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    code: e.target.value.toUpperCase()
                                                })
                                            }
                                            className={formErrors.code ? 'border-red-500' : ''}
                                        />
                                        {formErrors.code && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.code}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="number">Quantity *</Label>
                                        <Input
                                            id="number"
                                            type="number"
                                            value={formData.number}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    number: parseInt(e.target.value) || 0
                                                })
                                            }
                                            className={formErrors.number ? 'border-red-500' : ''}
                                        />
                                        {formErrors.number && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.number}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="discountPercent">
                                            Discount Percent (%)
                                        </Label>
                                        <Input
                                            id="discountPercent"
                                            type="number"
                                            value={formData.discountPercent ?? ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    discountPercent: e.target.value
                                                        ? parseFloat(e.target.value)
                                                        : null
                                                })
                                            }
                                            className={
                                                formErrors.discountPercent ? 'border-red-500' : ''
                                            }
                                        />
                                        {formErrors.discountPercent && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.discountPercent}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="maxDiscountValue">
                                            Max Discount Value (VND)
                                        </Label>
                                        <Input
                                            id="maxDiscountValue"
                                            type="number"
                                            value={formData.maxDiscountValue ?? ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    maxDiscountValue: e.target.value
                                                        ? parseFloat(e.target.value)
                                                        : null
                                                })
                                            }
                                            className={
                                                formErrors.maxDiscountValue ? 'border-red-500' : ''
                                            }
                                        />
                                        {formErrors.maxDiscountValue && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.maxDiscountValue}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="discountValue">Discount Value (VND)</Label>
                                        <Input
                                            id="discountValue"
                                            type="number"
                                            value={formData.discountValue ?? ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    discountValue: e.target.value
                                                        ? parseFloat(e.target.value)
                                                        : null
                                                })
                                            }
                                            className={
                                                formErrors.discountValue ? 'border-red-500' : ''
                                            }
                                        />
                                        {formErrors.discountValue && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.discountValue}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="minimumOrderValue">
                                            Minimum Order Value (VND)
                                        </Label>
                                        <Input
                                            id="minimumOrderValue"
                                            type="number"
                                            value={formData.minimumOrderValue ?? ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    minimumOrderValue: e.target.value
                                                        ? parseFloat(e.target.value)
                                                        : null
                                                })
                                            }
                                            className={
                                                formErrors.minimumOrderValue ? 'border-red-500' : ''
                                            }
                                        />
                                        {formErrors.minimumOrderValue && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.minimumOrderValue}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="validFrom">Valid From</Label>
                                        <Input
                                            id="validFrom"
                                            type="datetime-local"
                                            value={formData.validFrom}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    validFrom: e.target.value
                                                })
                                            }
                                            className={formErrors.validFrom ? 'border-red-500' : ''}
                                        />
                                        {formErrors.validFrom && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.validFrom}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="validTo">Valid To</Label>
                                        <Input
                                            id="validTo"
                                            type="datetime-local"
                                            value={formData.validTo}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    validTo: e.target.value
                                                })
                                            }
                                            className={formErrors.validTo ? 'border-red-500' : ''}
                                        />
                                        {formErrors.validTo && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.validTo}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isPrivate"
                                            checked={formData.isPrivate}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    isPrivate: checked as boolean
                                                })
                                            }
                                        />
                                        <Label htmlFor="isPrivate" className="cursor-pointer">
                                            Private Voucher
                                        </Label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelCreate}
                                        disabled={isCreating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateSubmit} disabled={isCreating}>
                                        {isCreating ? 'Creating...' : 'Create'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Results Summary */}
                    {totalVouchers > 0 && (
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600">
                                Showing {vouchers.length} of {totalVouchers} vouchers
                                {filterType !== 'all' && ` (${filterType})`}
                            </p>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                    )}

                    {/* Vouchers Table */}
                    <div className="rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Used</TableHead>
                                    <TableHead className="text-right">Discount %</TableHead>
                                    <TableHead className="text-right">Discount Value</TableHead>
                                    <TableHead className="text-right">Max Discount</TableHead>
                                    <TableHead className="text-right">Min Order</TableHead>
                                    <TableHead>Valid Period</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vouchers.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={11}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            No vouchers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vouchers.map((voucher) => {
                                        const isEditing = editingVoucher?.id === voucher.id
                                        return (
                                            <TableRow key={voucher.id}>
                                                {isEditing ? (
                                                    // Edit Mode
                                                    <>
                                                        <TableCell>
                                                            <Input
                                                                value={editFormData.name}
                                                                onChange={(e) =>
                                                                    setEditFormData({
                                                                        ...editFormData,
                                                                        name: e.target.value
                                                                    })
                                                                }
                                                                className={
                                                                    editFormErrors.name
                                                                        ? 'border-red-500'
                                                                        : ''
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={editFormData.code}
                                                                onChange={(e) =>
                                                                    setEditFormData({
                                                                        ...editFormData,
                                                                        code: e.target.value.toUpperCase()
                                                                    })
                                                                }
                                                                className={
                                                                    editFormErrors.code
                                                                        ? 'border-red-500'
                                                                        : ''
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    checked={editFormData.isPrivate}
                                                                    onCheckedChange={(checked) =>
                                                                        setEditFormData({
                                                                            ...editFormData,
                                                                            isPrivate:
                                                                                checked as boolean
                                                                        })
                                                                    }
                                                                />
                                                                <span className="text-sm">
                                                                    Private
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                value={editFormData.number}
                                                                onChange={(e) =>
                                                                    setEditFormData({
                                                                        ...editFormData,
                                                                        number:
                                                                            parseInt(
                                                                                e.target.value
                                                                            ) || 0
                                                                    })
                                                                }
                                                                className={
                                                                    editFormErrors.number
                                                                        ? 'border-red-500'
                                                                        : ''
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {voucher.usedCount}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                placeholder="Percent (%)"
                                                                value={
                                                                    editFormData.discountPercent ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setEditFormData({
                                                                        ...editFormData,
                                                                        discountPercent: e.target
                                                                            .value
                                                                            ? parseFloat(
                                                                                  e.target.value
                                                                              )
                                                                            : null
                                                                    })
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                placeholder="Fixed (VND)"
                                                                value={
                                                                    editFormData.discountValue ?? ''
                                                                }
                                                                onChange={(e) =>
                                                                    setEditFormData({
                                                                        ...editFormData,
                                                                        discountValue: e.target
                                                                            .value
                                                                            ? parseFloat(
                                                                                  e.target.value
                                                                              )
                                                                            : null
                                                                    })
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                placeholder="Max (VND)"
                                                                value={
                                                                    editFormData.maxDiscountValue ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setEditFormData({
                                                                        ...editFormData,
                                                                        maxDiscountValue: e.target
                                                                            .value
                                                                            ? parseFloat(
                                                                                  e.target.value
                                                                              )
                                                                            : null
                                                                    })
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    editFormData.minimumOrderValue ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setEditFormData({
                                                                        ...editFormData,
                                                                        minimumOrderValue: e.target
                                                                            .value
                                                                            ? parseFloat(
                                                                                  e.target.value
                                                                              )
                                                                            : null
                                                                    })
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-2">
                                                                <Input
                                                                    type="datetime-local"
                                                                    placeholder="From"
                                                                    value={editFormData.validFrom}
                                                                    onChange={(e) =>
                                                                        setEditFormData({
                                                                            ...editFormData,
                                                                            validFrom:
                                                                                e.target.value
                                                                        })
                                                                    }
                                                                />
                                                                <Input
                                                                    type="datetime-local"
                                                                    placeholder="To"
                                                                    value={editFormData.validTo}
                                                                    onChange={(e) =>
                                                                        setEditFormData({
                                                                            ...editFormData,
                                                                            validTo: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={handleSaveEdit}
                                                                    disabled={isUpdating}
                                                                >
                                                                    {isUpdating
                                                                        ? 'Saving...'
                                                                        : 'Save'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={handleCancelEditInline}
                                                                    disabled={isUpdating}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    // View Mode
                                                    <>
                                                        <TableCell className="font-medium">
                                                            {voucher.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <code className="px-2 py-1 bg-gray-700 text-white rounded font-mono">
                                                                {voucher.code}
                                                            </code>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs ${
                                                                    voucher.isPrivate
                                                                        ? 'bg-purple-100 text-purple-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                }`}
                                                            >
                                                                {voucher.isPrivate
                                                                    ? 'Private'
                                                                    : 'Public'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {voucher.number}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {voucher.usedCount}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {voucher.discountPercent !== null
                                                                ? `${voucher.discountPercent}%`
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {voucher.discountValue !== null
                                                                ? formatCurrency(
                                                                      voucher.discountValue
                                                                  )
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {voucher.maxDiscountValue !== null
                                                                ? formatCurrency(
                                                                      voucher.maxDiscountValue
                                                                  )
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {voucher.minimumOrderValue !== null
                                                                ? formatCurrency(
                                                                      voucher.minimumOrderValue
                                                                  )
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1 text-sm">
                                                                {voucher.validFrom && (
                                                                    <div>
                                                                        <span className="font-medium">
                                                                            From:{' '}
                                                                        </span>
                                                                        {formatDate(
                                                                            voucher.validFrom
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {voucher.validTo && (
                                                                    <div>
                                                                        <span className="font-medium">
                                                                            To:{' '}
                                                                        </span>
                                                                        {formatDate(
                                                                            voucher.validTo
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {!voucher.validFrom &&
                                                                    !voucher.validTo &&
                                                                    '-'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="relative inline-block dropdown-container">
                                                                <button
                                                                    onClick={() =>
                                                                        setActiveDropdown(
                                                                            activeDropdown ===
                                                                                voucher.id
                                                                                ? null
                                                                                : voucher.id
                                                                        )
                                                                    }
                                                                    className="p-2 hover:bg-gray-100 rounded"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>

                                                                {activeDropdown === voucher.id && (
                                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                                                        <div className="py-1">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleStartEdit(
                                                                                        voucher
                                                                                    )
                                                                                }}
                                                                                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 w-full text-left transition-colors"
                                                                            >
                                                                                <Edit2 className="h-4 w-4" />
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDelete(
                                                                                        voucher.id,
                                                                                        voucher.name
                                                                                    )
                                                                                }
                                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            {generatePaginationNumbers().map((pageNum, index) => {
                                if (pageNum === '...') {
                                    return (
                                        <span key={`dots-${index}`} className="px-2">
                                            ...
                                        </span>
                                    )
                                }

                                const page = pageNum as number
                                const isActive = currentPage === page

                                return (
                                    <Button
                                        key={page}
                                        variant={isActive ? 'default' : 'outline'}
                                        onClick={() => setCurrentPage(page)}
                                        className={
                                            isActive ? 'bg-[#e86d28] hover:bg-[#d35f1a]' : ''
                                        }
                                    >
                                        {page}
                                    </Button>
                                )
                            })}

                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
