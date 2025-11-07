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
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/shared/components/ui/select'
import { showToast } from '@/shared/utils/toast'
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

    // Edit states - inline editing in table
    const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null)
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
                showToast.error('An error occurred while loading data')
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
            errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email'
        }

        if (!formData.password.trim()) {
            errors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
        }

        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required'
        }

        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required'
        } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = 'Invalid phone number'
        }

        if (!formData.branchId) {
            errors.branchId = 'Please select a branch'
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

                showToast.success(
                    `Admin account "${newAdminAccount.fullName}" has been created successfully!`
                )
            } else {
                showToast.error(
                    response.message || 'An error occurred while creating admin account'
                )
            }
        } catch (error: unknown) {
            console.error('Error creating admin account:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'An error occurred while creating admin account'
            showToast.error(errorMessage)
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
                showToast.warning('Please enter at least one search criteria')
                return false
            }
        } catch (error) {
            console.error('Search error:', error)
            showToast.error('An error occurred while searching')
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
                    Showing {(currentPage - 1) * pageSize + 1} -{' '}
                    {Math.min(
                        currentPage * pageSize,
                        activeTab === 'all' ? totalItems : searchTotalItems
                    )}{' '}
                    of {activeTab === 'all' ? totalItems : searchTotalItems} results
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
            branchId: account.branchId,
            status: account.status,
            roleIds: accountRoleIds
        })
        setEditFormErrors({})
        // Removed setShowEditForm - will edit inline
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

        if (!editFormData.branchId) {
            errors.branchId = 'Please select a branch'
        }

        if (!editFormData.roleIds || editFormData.roleIds.length === 0) {
            errors.roleIds = 'Please select at least one role'
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

            // Build update data - omit password if empty (keep current password)
            const updateData: UpdateAdminAccountRequest = {
                email: editFormData.email,
                fullName: editFormData.fullName,
                phoneNumber: editFormData.phoneNumber,
                branchId: editFormData.branchId,
                status: editFormData.status,
                roleIds: editFormData.roleIds
            }

            // Only include password if user entered a new one
            if (editFormData.password && editFormData.password.trim()) {
                updateData.password = editFormData.password.trim()
            }

            const response = await updateAccount(editingAccount.id, updateData)

            if (response.success && response.data) {
                const updatedAccount: AdminAccount = response.data

                // Update the account in the list
                setAdminAccounts((prev) =>
                    prev.map((account) =>
                        account.id === editingAccount.id ? updatedAccount : account
                    )
                )

                setEditingAccount(null)
                setEditFormData({
                    email: '',
                    fullName: '',
                    phoneNumber: '',
                    branchId: '',
                    status: AccountStatus.ACTIVE,
                    roleIds: []
                    // password is undefined (keep current password)
                })
                setEditFormErrors({})

                showToast.success(
                    `Admin account "${updatedAccount.fullName}" has been updated successfully!`
                )
            } else {
                showToast.error(
                    response.message || 'An error occurred while updating admin account'
                )
            }
        } catch (error: unknown) {
            console.error('Error updating admin account:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            const errorMessage =
                apiError.response?.data?.message || 'An error occurred while updating admin account'
            showToast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditFormData({
            branchId: '',
            status: AccountStatus.ACTIVE,
            roleIds: []
        })
        setEditFormErrors({})
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
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-primary">Admin Account Management</CardTitle>
                            <CardDescription className="text-secondary">
                                Manage admin accounts and create new accounts
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                            disabled={showCreateForm || editingAccount !== null}
                        >
                            Create New Admin
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Search Form */}
            <Card className="bg-surface border-surface">
                <CardHeader>
                    <CardTitle className="text-primary">Search Admin</CardTitle>
                    <CardDescription className="text-secondary">
                        Search admins by name, email, or phone number
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <Input
                                placeholder="Search by name..."
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
                                placeholder="Search by email..."
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
                                placeholder="Search by phone..."
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
                                {isSearching ? 'Searching...' : 'Search'}
                            </Button>
                            <Button
                                onClick={handleClearSearch}
                                variant="outline"
                                disabled={isSearching}
                                className="flex-1"
                            >
                                Clear Filter
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Create Form */}
            {showCreateForm && (
                <Card className="bg-surface border-surface">
                    <CardHeader>
                        <CardTitle className="text-primary">Create New Admin Account</CardTitle>
                        <CardDescription className="text-secondary">
                            Enter information to create a new admin account
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
                                        onChange={(e) => handleInputChange('email', e.target.value)}
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
                                        Password *
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Enter password..."
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
                                        Full Name *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Enter full name..."
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
                                        Phone Number *
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
                                        Branch *
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
                                            <SelectValue placeholder="-- Select branch --" />
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
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateAdminAccount}
                                disabled={isCreating}
                                className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                            >
                                {isCreating ? 'Creating...' : 'Create Admin'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Admin Accounts List - Table with Inline Editing */}
            <Card className="bg-surface border-surface">
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <CardTitle className="text-primary">Admin Account Management</CardTitle>
                            <CardDescription className="text-secondary">
                                View and manage all admin accounts in the system
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
                            All Admins ({adminAccounts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                                activeTab === 'search'
                                    ? 'bg-orange-200/70 text-orange-800 shadow-sm'
                                    : 'bg-orange-50/20 text-orange-600 hover:text-orange-700 hover:bg-orange-50/40'
                            }`}
                        >
                            Search Results ({searchResults.length})
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-secondary">Loading...</div>
                        </div>
                    ) : (activeTab === 'all' ? adminAccounts : searchResults).length === 0 ? (
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
                                {activeTab === 'all' ? 'No admin accounts yet' : 'No results found'}
                            </h3>
                            <p className="text-secondary">
                                {activeTab === 'all'
                                    ? 'Click "Create New Admin" to create the first admin account'
                                    : 'Try changing search criteria or clear filter to see all accounts'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-surface">
                                        <th className="text-left p-4 font-semibold text-primary">
                                            Full Name
                                        </th>
                                        <th className="text-left p-4 font-semibold text-primary">
                                            Email
                                        </th>
                                        <th className="text-left p-4 font-semibold text-primary">
                                            Phone
                                        </th>
                                        <th className="text-left p-4 font-semibold text-primary">
                                            Branch
                                        </th>
                                        <th className="text-left p-4 font-semibold text-primary">
                                            Status
                                        </th>
                                        <th className="text-left p-4 font-semibold text-primary">
                                            Roles
                                        </th>
                                        <th className="text-left p-4 font-semibold text-primary">
                                            Created At
                                        </th>
                                        <th className="text-left p-4 font-semibold text-primary">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'all' ? adminAccounts : searchResults).map(
                                        (account) => {
                                            const branchName =
                                                branches.find((b) => b.id === account.branchId)
                                                    ?.name || 'Unknown'
                                            const isEditing = editingAccount?.id === account.id

                                            return (
                                                <React.Fragment key={account.id}>
                                                    <tr
                                                        className={`border-b border-surface transition-colors ${
                                                            isEditing
                                                                ? 'bg-orange-50/10'
                                                                : 'bg-brand hover:bg-surface/50'
                                                        }`}
                                                    >
                                                        <td className="p-4">
                                                            <div className="font-medium text-primary">
                                                                {account.fullName}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-secondary">
                                                            {account.email}
                                                        </td>
                                                        <td className="p-4 text-secondary">
                                                            {account.phoneNumber || 'N/A'}
                                                        </td>
                                                        <td className="p-4 text-secondary">
                                                            {branchName}
                                                        </td>
                                                        <td className="p-4">
                                                            <span
                                                                className={`px-3 py-1 text-xs font-medium rounded-md border ${
                                                                    account.status ===
                                                                    AccountStatus.ACTIVE
                                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                                }`}
                                                            >
                                                                {account.status ===
                                                                AccountStatus.ACTIVE
                                                                    ? 'Active'
                                                                    : 'Deleted'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {account.roleNames &&
                                                                account.roleNames.length > 0 ? (
                                                                    account.roleNames.map(
                                                                        (role, roleIndex) => (
                                                                            <span
                                                                                key={`${account.id}-role-${roleIndex}`}
                                                                                className="px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                                                                            >
                                                                                {role}
                                                                            </span>
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-600 border border-gray-200">
                                                                        No role
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-secondary text-sm">
                                                            {formatDate(account.createdAt)}
                                                        </td>
                                                        <td className="p-4">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (isEditing) {
                                                                        handleCancelEdit()
                                                                    } else {
                                                                        handleEditAccount(account)
                                                                    }
                                                                }}
                                                                disabled={
                                                                    editingAccount !== null &&
                                                                    !isEditing
                                                                }
                                                                className={`transition-colors ${
                                                                    isEditing
                                                                        ? 'border-red-500 text-red-600 bg-red-50 hover:bg-red-100 font-semibold'
                                                                        : 'border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 font-semibold'
                                                                }`}
                                                            >
                                                                {isEditing ? 'Cancel' : 'Edit'}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    {/* Inline Edit Form - Expands below the row */}
                                                    {isEditing && (
                                                        <tr>
                                                            <td colSpan={8} className="p-0">
                                                                <div className="p-6 bg-surface/50 border-t border-surface">
                                                                    <h4 className="text-sm font-semibold text-primary mb-4">
                                                                        Edit Account Information
                                                                    </h4>
                                                                    <div className="grid grid-cols-1 gap-6">
                                                                        <div className="space-y-4">
                                                                            {/* Branch */}
                                                                            <div>
                                                                                <label className="text-sm font-medium text-primary block mb-2">
                                                                                    Branch *
                                                                                </label>
                                                                                <Select
                                                                                    value={
                                                                                        editFormData.branchId
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value
                                                                                    ) =>
                                                                                        handleEditInputChange(
                                                                                            'branchId',
                                                                                            value
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        isUpdating
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger
                                                                                        className={`w-full bg-brand border-surface text-primary ${
                                                                                            editFormErrors.branchId
                                                                                                ? 'border-red-500'
                                                                                                : ''
                                                                                        }`}
                                                                                    >
                                                                                        <SelectValue placeholder="-- Select branch --" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent className="bg-surface border-surface">
                                                                                        {branches.map(
                                                                                            (
                                                                                                branch
                                                                                            ) => (
                                                                                                <SelectItem
                                                                                                    key={
                                                                                                        branch.id
                                                                                                    }
                                                                                                    value={
                                                                                                        branch.id
                                                                                                    }
                                                                                                    className="hover:bg-brand"
                                                                                                >
                                                                                                    {
                                                                                                        branch.name
                                                                                                    }
                                                                                                </SelectItem>
                                                                                            )
                                                                                        )}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                {editFormErrors.branchId && (
                                                                                    <p className="text-red-500 text-xs mt-1">
                                                                                        {
                                                                                            editFormErrors.branchId
                                                                                        }
                                                                                    </p>
                                                                                )}
                                                                            </div>

                                                                            {/* Status */}
                                                                            <div>
                                                                                <label className="text-sm font-medium text-primary block mb-2">
                                                                                    Status *
                                                                                </label>
                                                                                <Select
                                                                                    value={
                                                                                        editFormData.status
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value: AccountStatus
                                                                                    ) =>
                                                                                        handleEditInputChange(
                                                                                            'status',
                                                                                            value
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        isUpdating
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger className="w-full bg-brand border-surface text-primary">
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent className="bg-surface border-surface">
                                                                                        <SelectItem
                                                                                            value={
                                                                                                AccountStatus.ACTIVE
                                                                                            }
                                                                                        >
                                                                                            Active
                                                                                        </SelectItem>
                                                                                        <SelectItem
                                                                                            value={
                                                                                                AccountStatus.DELETED
                                                                                            }
                                                                                        >
                                                                                            Deleted
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
                                                                                    {roles.map(
                                                                                        (role) => (
                                                                                            <div
                                                                                                key={
                                                                                                    role.roleId
                                                                                                }
                                                                                                className="flex items-center space-x-2"
                                                                                            >
                                                                                                <Checkbox
                                                                                                    id={`edit-role-${role.roleId}`}
                                                                                                    checked={editFormData.roleIds?.includes(
                                                                                                        role.roleId
                                                                                                    )}
                                                                                                    onCheckedChange={(
                                                                                                        checked
                                                                                                    ) => {
                                                                                                        const currentRoleIds =
                                                                                                            editFormData.roleIds ||
                                                                                                            []
                                                                                                        const newRoleIds =
                                                                                                            checked
                                                                                                                ? [
                                                                                                                      ...currentRoleIds,
                                                                                                                      role.roleId
                                                                                                                  ]
                                                                                                                : currentRoleIds.filter(
                                                                                                                      (
                                                                                                                          id
                                                                                                                      ) =>
                                                                                                                          id !==
                                                                                                                          role.roleId
                                                                                                                  )
                                                                                                        handleEditInputChange(
                                                                                                            'roleIds',
                                                                                                            newRoleIds
                                                                                                        )
                                                                                                    }}
                                                                                                    disabled={
                                                                                                        isUpdating
                                                                                                    }
                                                                                                />
                                                                                                <label
                                                                                                    htmlFor={`edit-role-${role.roleId}`}
                                                                                                    className="text-sm text-primary cursor-pointer"
                                                                                                >
                                                                                                    {
                                                                                                        role.roleName
                                                                                                    }
                                                                                                </label>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                                {editFormErrors.roleIds && (
                                                                                    <p className="text-red-500 text-xs mt-1">
                                                                                        {
                                                                                            editFormErrors.roleIds
                                                                                        }
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Form Actions */}
                                                                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-surface">
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={
                                                                                handleCancelEdit
                                                                            }
                                                                            disabled={isUpdating}
                                                                            className="border-surface text-secondary hover:bg-brand"
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            onClick={
                                                                                handleUpdateAdminAccount
                                                                            }
                                                                            disabled={isUpdating}
                                                                            className="btn-primary hover:bg-[#e86d28]"
                                                                        >
                                                                            {isUpdating
                                                                                ? 'Updating...'
                                                                                : 'Update'}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            )
                                        }
                                    )}
                                </tbody>
                            </table>
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
    )
}

export default AdminAccountManageForm
