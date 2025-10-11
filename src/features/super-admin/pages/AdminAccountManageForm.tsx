import type { Role } from '@/features/auth/types/role.type'
import {
    createAdminAccount,
    getAllAdminAccounts,
    searchAccounts,
    updateAccount
} from '@/shared/api/account-api'
import type { Branch } from '@/shared/api/branch-api'
import { getAllBranches } from '@/shared/api/branch-api'
import { getAllRole } from '@/shared/api/role-api'
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
import React, { useEffect, useState } from 'react'
import {
    AccountStatus,
    type AdminAccount,
    type CreateAdminAccountRequest,
    type SearchAdminAccountParams,
    type UpdateAdminAccountRequest
} from '../types/account-admin.types'

const AdminAccountManageForm: React.FC = () => {
    const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false)

    // Edit states
    const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null)
    const [showEditForm, setShowEditForm] = useState<boolean>(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)

    // Form states
    const [formData, setFormData] = useState<CreateAdminAccountRequest>({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        branchId: ''
    })

    // Edit form states
    const [editFormData, setEditFormData] = useState<UpdateAdminAccountRequest>({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        branchId: '',
        status: AccountStatus.ACTIVE,
        roleIds: []
    })

    // Form validation
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})

    // Tab states
    const [activeTab, setActiveTab] = useState<'all' | 'search'>('all')

    // Search states
    const [searchParams, setSearchParams] = useState<SearchAdminAccountParams>({
        name: '',
        email: '',
        phoneNumber: ''
    })
    const [searchResults, setSearchResults] = useState<AdminAccount[]>([])
    const [isSearching, setIsSearching] = useState<boolean>(false)

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize] = useState<number>(10)
    const [totalItems, setTotalItems] = useState<number>(0)
    const [searchCurrentPage, setSearchCurrentPage] = useState<number>(1)
    const [searchTotalItems, setSearchTotalItems] = useState<number>(0)

    // Fetch admin accounts and branches on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch admin accounts, branches, and roles in parallel
                const [adminAccountsResponse, branchesResponse, rolesResponse] = await Promise.all([
                    getAllAdminAccounts({
                        limit: pageSize,
                        offset: (currentPage - 1) * pageSize
                    }),
                    getAllBranches(),
                    getAllRole()
                ])

                if (adminAccountsResponse.success && adminAccountsResponse.data) {
                    setAdminAccounts(adminAccountsResponse.data.items)
                    setTotalItems(adminAccountsResponse.data.meta.total)
                }

                if (branchesResponse.data) {
                    setBranches(branchesResponse.data)
                }

                if (rolesResponse.data && rolesResponse.data.data) {
                    const apiRoles: Role[] = rolesResponse.data.data.map(
                        (role: { id: string; name: string }) => ({
                            roleId: role.id,
                            roleName: role.name
                        })
                    )
                    setRoles(apiRoles)
                }

                console.log('Loaded admin accounts:', adminAccountsResponse.data)
                console.log('Loaded branches:', branchesResponse.data)
                console.log('Loaded roles:', rolesResponse.data)
            } catch (error) {
                console.error('Error fetching data:', error)
                alert('Có lỗi xảy ra khi tải dữ liệu')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [currentPage, pageSize])

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.email.trim()) {
            errors.email = 'Email là bắt buộc'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email không hợp lệ'
        }

        if (!formData.password.trim()) {
            errors.password = 'Mật khẩu là bắt buộc'
        } else if (formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
        }

        if (!formData.fullName.trim()) {
            errors.fullName = 'Họ tên là bắt buộc'
        }

        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Số điện thoại là bắt buộc'
        } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = 'Số điện thoại không hợp lệ'
        }

        if (!formData.branchId) {
            errors.branchId = 'Vui lòng chọn chi nhánh'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle form input changes
    const handleInputChange = (field: keyof CreateAdminAccountRequest, value: string) => {
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

    // Handle create admin account
    const handleCreateAdminAccount = async () => {
        if (!validateForm()) {
            return
        }

        setIsCreating(true)
        try {
            console.log('Creating admin account:', formData)

            const response = await createAdminAccount(formData)

            if (response.success && response.data) {
                const newAdminAccount: AdminAccount = response.data

                // Add branch name to the account for display
                const branch = branches.find((b) => b.id === newAdminAccount.branchId)
                if (branch) {
                    newAdminAccount.branchName = branch.name
                }

                setAdminAccounts((prev) => [...prev, newAdminAccount])

                // Reset form
                setFormData({
                    email: '',
                    password: '',
                    fullName: '',
                    phoneNumber: '',
                    branchId: ''
                })
                setShowCreateForm(false)

                alert(`Tài khoản admin "${newAdminAccount.fullName}" đã được tạo thành công!`)
            } else {
                alert(response.message || 'Có lỗi xảy ra khi tạo tài khoản admin')
            }
        } catch (error: unknown) {
            console.error('Error creating admin account:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản admin'
            alert(errorMessage)
        } finally {
            setIsCreating(false)
        }
    }

    // Handle cancel create form
    const handleCancelCreate = () => {
        setFormData({
            email: '',
            password: '',
            fullName: '',
            phoneNumber: '',
            branchId: ''
        })
        setFormErrors({})
        setShowCreateForm(false)
    }

    // Handle search
    const performSearch = async (page: number = searchCurrentPage) => {
        try {
            setIsSearching(true)
            // Filter out empty search params
            const filteredParams: SearchAdminAccountParams = {}
            if (searchParams.name?.trim()) filteredParams.name = searchParams.name.trim()
            if (searchParams.email?.trim()) filteredParams.email = searchParams.email.trim()
            if (searchParams.phoneNumber?.trim())
                filteredParams.phoneNumber = searchParams.phoneNumber.trim()

            // Only search if there are params
            if (Object.keys(filteredParams).length > 0) {
                // Add pagination params to search
                const searchParamsWithPagination = {
                    ...filteredParams,
                    limit: pageSize,
                    offset: (page - 1) * pageSize
                }
                console.log('Search params with pagination:', searchParamsWithPagination)
                const response = await searchAccounts(searchParamsWithPagination)
                console.log('Search response:', response)
                if (response.success && response.data) {
                    setSearchResults(response.data.items)
                    setSearchTotalItems(response.data.meta.total)
                } else {
                    setSearchResults([])
                    setSearchTotalItems(0)
                }
                setActiveTab('search') // Switch to search tab after successful search
                return true
            } else {
                alert('Vui lòng nhập ít nhất một tiêu chí tìm kiếm')
                return false
            }
        } catch (error) {
            console.error('Search error:', error)
            alert('Có lỗi xảy ra khi tìm kiếm')
            setSearchResults([])
            setSearchTotalItems(0)
            setActiveTab('search') // Still switch to search tab to show empty result
            return false
        } finally {
            setIsSearching(false)
        }
    }

    const handleSearch = async () => {
        await performSearch(1) // Always start from page 1 for new search
        setSearchCurrentPage(1) // Reset to page 1
    }

    const handleClearSearch = () => {
        setSearchParams({
            name: '',
            email: '',
            phoneNumber: ''
        })
        setSearchResults([])
        setSearchTotalItems(0)
        setSearchCurrentPage(1)
        setActiveTab('all') // Switch back to all accounts tab
    }

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSearchPageChange = async (page: number) => {
        console.log('Changing search page to:', page)
        setSearchCurrentPage(page)
        // Re-trigger search with specific page
        await performSearch(page)
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / pageSize)
    const searchTotalPages = Math.ceil(searchTotalItems / pageSize)

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
                    {Math.min(
                        currentPage * pageSize,
                        activeTab === 'all' ? totalItems : searchTotalItems
                    )}{' '}
                    trong tổng số {activeTab === 'all' ? totalItems : searchTotalItems} kết quả
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

    // Handle edit account
    const handleEditAccount = (account: AdminAccount) => {
        console.log('Editing account:', account)
        console.log('Account roleIds:', account.roleIds)
        console.log('Account roleNames:', account.roleNames)
        console.log('Available roles:', roles)

        // If roleIds is not available, convert from roleNames to roleIds
        let accountRoleIds = account.roleIds || []
        if (accountRoleIds.length === 0 && account.roleNames && account.roleNames.length > 0) {
            accountRoleIds = roles
                .filter((role) => account.roleNames.includes(role.roleName))
                .map((role) => role.roleId)
            console.log('Converted roleNames to roleIds:', accountRoleIds)
        }

        setEditingAccount(account)
        setEditFormData({
            email: account.email,
            password: '', // Leave empty for security
            fullName: account.fullName,
            phoneNumber: account.phoneNumber || '',
            branchId: account.branchId,
            status: account.status,
            roleIds: accountRoleIds
        })
        setEditFormErrors({})
        setShowEditForm(true)
        setShowCreateForm(false) // Close create form if open
    }

    // Handle edit form input changes
    const handleEditInputChange = (
        field: keyof UpdateAdminAccountRequest,
        value: string | string[]
    ) => {
        setEditFormData((prev: UpdateAdminAccountRequest) => ({
            ...prev,
            [field]: value
        }))

        // Clear error for this field when user starts typing
        if (editFormErrors[field as string]) {
            setEditFormErrors((prev) => ({
                ...prev,
                [field as string]: ''
            }))
        }
    }

    // Validate edit form
    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!editFormData.email.trim()) {
            errors.email = 'Email là bắt buộc'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
            errors.email = 'Email không hợp lệ'
        }

        if (!editFormData.fullName.trim()) {
            errors.fullName = 'Họ tên là bắt buộc'
        }

        if (!editFormData.phoneNumber.trim()) {
            errors.phoneNumber = 'Số điện thoại là bắt buộc'
        } else if (!/^[0-9]{10,11}$/.test(editFormData.phoneNumber)) {
            errors.phoneNumber = 'Số điện thoại không hợp lệ'
        }

        if (!editFormData.branchId) {
            errors.branchId = 'Vui lòng chọn chi nhánh'
        }

        if (editFormData.roleIds.length === 0) {
            errors.roleIds = 'Vui lòng chọn ít nhất một role'
        }

        setEditFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle update admin account
    const handleUpdateAdminAccount = async () => {
        if (!validateEditForm() || !editingAccount) {
            return
        }

        setIsUpdating(true)
        try {
            console.log('Updating admin account:', editingAccount.id, editFormData)

            const response = await updateAccount(editingAccount.id, editFormData)

            if (response.success && response.data) {
                const updatedAccount: AdminAccount = response.data

                // Update the account in the list
                setAdminAccounts((prev) =>
                    prev.map((account) =>
                        account.id === editingAccount.id ? updatedAccount : account
                    )
                )

                setShowEditForm(false)
                setEditingAccount(null)

                alert(`Tài khoản admin "${updatedAccount.fullName}" đã được cập nhật thành công!`)
            } else {
                alert(response.message || 'Có lỗi xảy ra khi cập nhật tài khoản admin')
            }
        } catch (error: unknown) {
            console.error('Error updating admin account:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tài khoản admin'
            alert(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditFormData({
            email: '',
            password: '',
            fullName: '',
            phoneNumber: '',
            branchId: '',
            status: AccountStatus.ACTIVE,
            roleIds: []
        })
        setEditFormErrors({})
        setShowEditForm(false)
        setEditingAccount(null)
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
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
                                    <CardTitle className="text-primary">
                                        Quản lý Tài khoản Admin
                                    </CardTitle>
                                    <CardDescription className="text-secondary">
                                        Quản lý danh sách tài khoản admin và tạo tài khoản mới
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={() => setShowCreateForm(true)}
                                    className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                    disabled={showCreateForm || showEditForm}
                                >
                                    Tạo Admin Mới
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Search Form */}
                    <Card className="bg-surface border-surface">
                        <CardHeader>
                            <CardTitle className="text-primary">Tìm kiếm Admin</CardTitle>
                            <CardDescription className="text-secondary">
                                Tìm kiếm admin theo tên, email hoặc số điện thoại
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <Input
                                        placeholder="Tìm theo tên..."
                                        value={searchParams.name || ''}
                                        onChange={(e) =>
                                            setSearchParams((prev) => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <Input
                                        placeholder="Tìm theo email..."
                                        value={searchParams.email || ''}
                                        onChange={(e) =>
                                            setSearchParams((prev) => ({
                                                ...prev,
                                                email: e.target.value
                                            }))
                                        }
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <Input
                                        placeholder="Tìm theo số điện thoại..."
                                        value={searchParams.phoneNumber || ''}
                                        onChange={(e) =>
                                            setSearchParams((prev) => ({
                                                ...prev,
                                                phoneNumber: e.target.value
                                            }))
                                        }
                                        className="input-field"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="btn-primary flex-1"
                                    >
                                        {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
                                    </Button>
                                    <Button
                                        onClick={handleClearSearch}
                                        variant="outline"
                                        disabled={isSearching}
                                        className="flex-1"
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Create Form */}
                    {showCreateForm && (
                        <Card className="bg-surface border-surface">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    Tạo Tài Khoản Admin Mới
                                </CardTitle>
                                <CardDescription className="text-secondary">
                                    Nhập thông tin để tạo tài khoản admin mới
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        {/* Email */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Email *
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="admin@example.com"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    handleInputChange('email', e.target.value)
                                                }
                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                    formErrors.email ? 'border-red-500' : ''
                                                }`}
                                            />
                                            {formErrors.email && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {formErrors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Mật khẩu *
                                            </label>
                                            <Input
                                                type="password"
                                                placeholder="Nhập mật khẩu..."
                                                value={formData.password}
                                                onChange={(e) =>
                                                    handleInputChange('password', e.target.value)
                                                }
                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                    formErrors.password ? 'border-red-500' : ''
                                                }`}
                                            />
                                            {formErrors.password && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {formErrors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Full Name */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Họ tên *
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="Nhập họ tên..."
                                                value={formData.fullName}
                                                onChange={(e) =>
                                                    handleInputChange('fullName', e.target.value)
                                                }
                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                    formErrors.fullName ? 'border-red-500' : ''
                                                }`}
                                            />
                                            {formErrors.fullName && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {formErrors.fullName}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Phone */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Số điện thoại *
                                            </label>
                                            <Input
                                                type="tel"
                                                placeholder="0123456789"
                                                value={formData.phoneNumber}
                                                onChange={(e) =>
                                                    handleInputChange('phoneNumber', e.target.value)
                                                }
                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                    formErrors.phoneNumber ? 'border-red-500' : ''
                                                }`}
                                            />
                                            {formErrors.phoneNumber && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {formErrors.phoneNumber}
                                                </p>
                                            )}
                                        </div>

                                        {/* Branch */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Chi nhánh *
                                            </label>
                                            <Select
                                                value={formData.branchId}
                                                onValueChange={(value) =>
                                                    handleInputChange('branchId', value)
                                                }
                                            >
                                                <SelectTrigger
                                                    className={`w-full bg-brand border-surface text-primary hover:bg-[#1f2937] transition-colors ${
                                                        formErrors.branchId ? 'border-red-500' : ''
                                                    }`}
                                                >
                                                    <SelectValue placeholder="-- Chọn chi nhánh --" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-surface border-surface">
                                                    {branches.map((branch) => (
                                                        <SelectItem
                                                            key={branch.id}
                                                            value={branch.id}
                                                            className="hover:bg-brand focus:bg-brand"
                                                        >
                                                            <div>
                                                                <div className="font-medium text-primary">
                                                                    {branch.name}
                                                                </div>
                                                                <div className="text-xs text-secondary">
                                                                    {branch.address}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.branchId && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {formErrors.branchId}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-surface">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelCreate}
                                        disabled={isCreating}
                                        className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleCreateAdminAccount}
                                        disabled={isCreating}
                                        className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                    >
                                        {isCreating ? 'Đang tạo...' : 'Tạo Admin'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Edit Form */}
                    {showEditForm && editingAccount && (
                        <Card className="bg-surface border-surface">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    Chỉnh sửa Tài Khoản Admin
                                </CardTitle>
                                <CardDescription className="text-secondary">
                                    Cập nhật thông tin tài khoản: {editingAccount.fullName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        {/* Email */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Email *
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="admin@example.com"
                                                value={editFormData.email}
                                                onChange={(e) =>
                                                    handleEditInputChange('email', e.target.value)
                                                }
                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                    editFormErrors.email ? 'border-red-500' : ''
                                                }`}
                                            />
                                            {editFormErrors.email && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {editFormErrors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Mật khẩu mới (để trống nếu không thay đổi)
                                            </label>
                                            <Input
                                                type="password"
                                                placeholder="Nhập mật khẩu mới..."
                                                value={editFormData.password}
                                                onChange={(e) =>
                                                    handleEditInputChange(
                                                        'password',
                                                        e.target.value
                                                    )
                                                }
                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                    editFormErrors.password ? 'border-red-500' : ''
                                                }`}
                                            />
                                            {editFormErrors.password && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {editFormErrors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Full Name */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Họ tên *
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="Nhập họ tên..."
                                                value={editFormData.fullName}
                                                onChange={(e) =>
                                                    handleEditInputChange(
                                                        'fullName',
                                                        e.target.value
                                                    )
                                                }
                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                    editFormErrors.fullName ? 'border-red-500' : ''
                                                }`}
                                            />
                                            {editFormErrors.fullName && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {editFormErrors.fullName}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Số điện thoại *
                                            </label>
                                            <Input
                                                type="tel"
                                                placeholder="0123456789"
                                                value={editFormData.phoneNumber}
                                                onChange={(e) =>
                                                    handleEditInputChange(
                                                        'phoneNumber',
                                                        e.target.value
                                                    )
                                                }
                                                className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                    editFormErrors.phoneNumber
                                                        ? 'border-red-500'
                                                        : ''
                                                }`}
                                            />
                                            {editFormErrors.phoneNumber && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {editFormErrors.phoneNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Branch */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Chi nhánh *
                                            </label>
                                            <Select
                                                value={editFormData.branchId}
                                                onValueChange={(value) =>
                                                    handleEditInputChange('branchId', value)
                                                }
                                            >
                                                <SelectTrigger
                                                    className={`w-full bg-brand border-surface text-primary hover:bg-[#1f2937] transition-colors ${
                                                        editFormErrors.branchId
                                                            ? 'border-red-500'
                                                            : ''
                                                    }`}
                                                >
                                                    <SelectValue placeholder="-- Chọn chi nhánh --" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-surface border-surface">
                                                    {branches.map((branch) => (
                                                        <SelectItem
                                                            key={branch.id}
                                                            value={branch.id}
                                                            className="hover:bg-brand focus:bg-brand"
                                                        >
                                                            <div>
                                                                <div className="font-medium text-primary">
                                                                    {branch.name}
                                                                </div>
                                                                <div className="text-xs text-secondary">
                                                                    {branch.address}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {editFormErrors.branchId && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {editFormErrors.branchId}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Trạng thái *
                                            </label>
                                            <Select
                                                value={editFormData.status}
                                                onValueChange={(value: AccountStatus) =>
                                                    handleEditInputChange('status', value)
                                                }
                                            >
                                                <SelectTrigger className="w-full bg-brand border-surface text-primary hover:bg-[#1f2937] transition-colors">
                                                    <SelectValue placeholder="-- Chọn trạng thái --" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-surface border-surface">
                                                    <SelectItem
                                                        value={AccountStatus.ACTIVE}
                                                        className="hover:bg-brand focus:bg-brand"
                                                    >
                                                        <div className="font-medium text-primary">
                                                            Hoạt động
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={AccountStatus.DELETED}
                                                        className="hover:bg-brand focus:bg-brand"
                                                    >
                                                        <div className="font-medium text-primary">
                                                            Đã xóa
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Roles */}
                                        <div>
                                            <label className="text-sm font-medium text-primary block mb-2">
                                                Roles *
                                            </label>
                                            <div className="space-y-2 max-h-32 overflow-y-auto border border-surface rounded-md p-3 bg-brand">
                                                {roles.map((role) => {
                                                    const isChecked = editFormData.roleIds.includes(
                                                        role.roleId
                                                    )
                                                    console.log(
                                                        `Role ${role.roleName} (${role.roleId}):`,
                                                        isChecked,
                                                        'Current roleIds:',
                                                        editFormData.roleIds
                                                    )

                                                    return (
                                                        <div
                                                            key={role.roleId}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                id={`edit-role-${role.roleId}`}
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                    const newRoleIds = e.target
                                                                        .checked
                                                                        ? [
                                                                              ...editFormData.roleIds,
                                                                              role.roleId
                                                                          ]
                                                                        : editFormData.roleIds.filter(
                                                                              (id: string) =>
                                                                                  id !== role.roleId
                                                                          )
                                                                    handleEditInputChange(
                                                                        'roleIds',
                                                                        newRoleIds
                                                                    )
                                                                }}
                                                                className="text-primary"
                                                            />
                                                            <label
                                                                htmlFor={`edit-role-${role.roleId}`}
                                                                className="text-sm text-primary cursor-pointer"
                                                            >
                                                                {role.roleName}
                                                            </label>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            {editFormErrors.roleIds && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {editFormErrors.roleIds}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-surface">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        disabled={isUpdating}
                                        className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleUpdateAdminAccount}
                                        disabled={isUpdating}
                                        className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                    >
                                        {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Admin Accounts List */}
                    <Card className="bg-surface border-surface">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <CardTitle className="text-primary">
                                        Quản lý Tài khoản Admin
                                    </CardTitle>
                                    <CardDescription className="text-secondary">
                                        Xem và quản lý tất cả tài khoản admin trong hệ thống
                                    </CardDescription>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                                        activeTab === 'all'
                                            ? 'bg-orange-200/70 text-orange-800 shadow-sm'
                                            : 'bg-orange-50/20 text-orange-600 hover:text-orange-700 hover:bg-orange-50/40'
                                    }`}
                                >
                                    Tất cả Admin ({adminAccounts.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('search')}
                                    className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                                        activeTab === 'search'
                                            ? 'bg-orange-200/70 text-orange-800 shadow-sm'
                                            : 'bg-orange-50/20 text-orange-600 hover:text-orange-700 hover:bg-orange-50/40'
                                    }`}
                                >
                                    Kết quả tìm kiếm ({searchResults.length})
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="text-secondary">Đang tải...</div>
                                </div>
                            ) : (activeTab === 'all' ? adminAccounts : searchResults).length ===
                              0 ? (
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
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-primary mb-2">
                                        {activeTab === 'all'
                                            ? 'Chưa có tài khoản admin nào'
                                            : 'Không tìm thấy kết quả'}
                                    </h3>
                                    <p className="text-secondary">
                                        {activeTab === 'all'
                                            ? 'Nhấn "Tạo Admin Mới" để tạo tài khoản admin đầu tiên'
                                            : 'Thử thay đổi tiêu chí tìm kiếm hoặc xóa bộ lọc để xem tất cả tài khoản'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(activeTab === 'all' ? adminAccounts : searchResults).map(
                                        (account) => {
                                            const branchName =
                                                branches.find((b) => b.id === account.branchId)
                                                    ?.name || 'Không xác định'

                                            return (
                                                <div
                                                    key={account.id}
                                                    className="p-4 bg-brand border border-surface rounded-lg hover:shadow-lg transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-3 mb-3">
                                                                <h3 className="font-semibold text-primary">
                                                                    {account.fullName}
                                                                </h3>
                                                                <span
                                                                    className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                                                                        account.status ===
                                                                        AccountStatus.ACTIVE
                                                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                                    }`}
                                                                >
                                                                    {account.status ===
                                                                    AccountStatus.ACTIVE
                                                                        ? 'Hoạt động'
                                                                        : 'Đã xóa'}
                                                                </span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {account.roleNames &&
                                                                    account.roleNames.length > 0 ? (
                                                                        account.roleNames.map(
                                                                            (role, index) => (
                                                                                <span
                                                                                    key={`${account.id}-role-${index}`}
                                                                                    className="px-3 py-1 text-xs font-medium rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/15 transition-colors"
                                                                                >
                                                                                    {role}
                                                                                </span>
                                                                            )
                                                                        )
                                                                    ) : (
                                                                        <span className="px-3 py-1 text-xs font-medium rounded-md bg-surface/50 text-secondary border border-surface">
                                                                            Không có role
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                                <div className="text-secondary">
                                                                    <span className="font-medium">
                                                                        Email:
                                                                    </span>{' '}
                                                                    {account.email}
                                                                </div>
                                                                <div className="text-secondary">
                                                                    <span className="font-medium">
                                                                        SĐT:
                                                                    </span>{' '}
                                                                    {account.phoneNumber}
                                                                </div>
                                                                <div className="text-secondary">
                                                                    <span className="font-medium">
                                                                        Chi nhánh:
                                                                    </span>{' '}
                                                                    {branchName}
                                                                </div>
                                                                <div className="text-secondary">
                                                                    <span className="font-medium">
                                                                        Tạo lúc:
                                                                    </span>{' '}
                                                                    {formatDate(account.createdAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleEditAccount(account)
                                                                }
                                                                className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                                            >
                                                                Chỉnh sửa
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            <PaginationComponent
                                currentPage={activeTab === 'all' ? currentPage : searchCurrentPage}
                                totalPages={activeTab === 'all' ? totalPages : searchTotalPages}
                                onPageChange={
                                    activeTab === 'all' ? handlePageChange : handleSearchPageChange
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AdminAccountManageForm
