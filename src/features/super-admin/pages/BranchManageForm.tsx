import { useAuthStore } from '@/features/auth/stores/auth.store'
import { updateAccount } from '@/shared/api/account-api'
import {
    createBranch,
    deleteBranch,
    getAllBranches,
    updateBranch,
    type Branch,
    type CreateBranchRequest
} from '@/shared/api/branch-api'
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
import { showDeleteConfirm } from '@/shared/utils/confirm'
import { showToast } from '@/shared/utils/toast'
import { useNavigate } from '@tanstack/react-router'
import { Calendar, Edit2, Eye, MoreHorizontal, Trash2, Users } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const BranchManageForm: React.FC = () => {
    const navigate = useNavigate()
    const { account } = useAuthStore()
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
    const [formData, setFormData] = useState<CreateBranchRequest>({
        name: '',
        address: ''
    })
    const [editFormData, setEditFormData] = useState<CreateBranchRequest>({
        name: '',
        address: ''
    })
    const [formErrors, setFormErrors] = useState({ name: false, address: false })
    const [editFormErrors, setEditFormErrors] = useState({ name: false, address: false })
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const toggleDropdown = (branchId: string) => {
        setActiveDropdown(activeDropdown === branchId ? null : branchId)
    }

    // Fetch all branches on component mount
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setLoading(true)
                const response = await getAllBranches()

                if (response.success && response.data) {
                    setBranches(response.data)
                } else {
                    throw new Error(response.message || 'Failed to fetch branches')
                }
            } catch (error) {
                console.error('Error fetching branches:', error)
                showToast.error('An error occurred while loading branch list')
            } finally {
                setLoading(false)
            }
        }
        fetchBranches()
    }, [])

    const handleCreateBranch = async () => {
        if (!formData.name.trim() || !formData.address.trim()) {
            setFormErrors({
                name: !formData.name.trim(),
                address: !formData.address.trim()
            })
            showToast.warning('Please enter complete information')
            return
        }

        setIsCreating(true)
        try {
            const response = await createBranch({
                name: formData.name.trim(),
                address: formData.address.trim()
            })

            if (response.success && response.data) {
                setBranches((prev) => [...prev, response.data])
                setFormData({ name: '', address: '' })
                setShowCreateForm(false)
                setFormErrors({ name: false, address: false })
                showToast.success('Branch created successfully!')
            } else {
                throw new Error(response.message || 'Failed to create branch')
            }
        } catch (error) {
            console.error('Error creating branch:', error)
            showToast.error('An error occurred while creating branch')
        } finally {
            setIsCreating(false)
        }
    }

    const handleUpdateBranch = async () => {
        if (!editingBranch || !editFormData.name.trim() || !editFormData.address.trim()) {
            setEditFormErrors({
                name: !editFormData.name.trim(),
                address: !editFormData.address.trim()
            })
            showToast.warning('Please enter complete information')
            return
        }

        setIsUpdating(true)
        try {
            const response = await updateBranch(editingBranch.id, {
                name: editFormData.name.trim(),
                address: editFormData.address.trim()
            })

            if (response.success && response.data) {
                setBranches((prev) =>
                    prev.map((branch) => (branch.id === editingBranch.id ? response.data : branch))
                )
                setEditFormData({ name: '', address: '' })
                setEditingBranch(null)
                setEditFormErrors({ name: false, address: false })
                showToast.success('Branch updated successfully!')
            } else {
                throw new Error(response.message || 'Failed to update branch')
            }
        } catch (error) {
            console.error('Error updating branch:', error)
            showToast.error('An error occurred while updating branch')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteBranch = async (branch: Branch) => {
        showDeleteConfirm({
            title: 'Delete Branch',
            message: '',
            itemName: branch.name,
            onConfirm: async () => {
                try {
                    const response = await deleteBranch(branch.id)

                    if (response.success) {
                        setBranches((prev) => prev.filter((b) => b.id !== branch.id))
                        showToast.success(`Branch "${branch.name}" has been deleted successfully!`)
                    } else {
                        throw new Error(response.message || 'Failed to delete branch')
                    }
                } catch (error) {
                    console.error('Error deleting branch:', error)
                    showToast.error('An error occurred while deleting branch')
                }
            }
        })
    }

    const handleEditBranch = (branch: Branch) => {
        setEditingBranch(branch)
        setEditFormData({
            name: branch.name,
            address: branch.address
        })
        setEditFormErrors({ name: false, address: false })
    }

    const handleViewRooms = async (branch: Branch) => {
        if (!account) {
            showToast.error('Account information not found')
            return
        }

        try {
            setActiveDropdown(null)

            // Update account's branch - only send branchId
            const response = await updateAccount(account.id, {
                branchId: branch.id
            })

            if (response.success) {
                showToast.success(`Switched to branch: ${branch.name}`)
                navigate({ to: '/super-admin/rooms' })
            } else {
                throw new Error(response.message || 'Failed to update branch')
            }
        } catch (error) {
            console.error('Error updating branch:', error)
            showToast.error('An error occurred while switching branch')
        }
    }

    const handleViewShowTimes = async (branch: Branch) => {
        if (!account) {
            showToast.error('Account information not found')
            return
        }

        try {
            setActiveDropdown(null)

            // Update account's branch - only send branchId
            const response = await updateAccount(account.id, {
                branchId: branch.id
            })

            if (response.success) {
                showToast.success(`Switched to branch: ${branch.name}`)
                navigate({ to: '/super-admin/show-times' })
            } else {
                throw new Error(response.message || 'Failed to update branch')
            }
        } catch (error) {
            console.error('Error updating branch:', error)
            showToast.error('An error occurred while switching branch')
        }
    }

    const handleViewStaffAccounts = async (branch: Branch) => {
        if (!account) {
            showToast.error('Account information not found')
            return
        }

        try {
            setActiveDropdown(null)

            // Update account's branch - only send branchId
            const response = await updateAccount(account.id, {
                branchId: branch.id
            })

            if (response.success) {
                showToast.success(`Switched to branch: ${branch.name}`)
                navigate({ to: '/super-admin/staff-accounts' })
            } else {
                throw new Error(response.message || 'Failed to update branch')
            }
        } catch (error) {
            console.error('Error updating branch:', error)
            showToast.error('An error occurred while switching branch')
        }
    }

    const handleCancelEdit = () => {
        setEditingBranch(null)
        setEditFormData({ name: '', address: '' })
        setEditFormErrors({ name: false, address: false })
    }

    const handleCancelCreate = () => {
        setShowCreateForm(false)
        setFormData({ name: '', address: '' })
        setFormErrors({ name: false, address: false })
    }

    const handleInputChange = (field: keyof CreateBranchRequest, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setFormErrors((prev) => ({ ...prev, [field]: false }))
    }

    const handleEditInputChange = (field: keyof CreateBranchRequest, value: string) => {
        setEditFormData((prev) => ({ ...prev, [field]: value }))
        setEditFormErrors((prev) => ({ ...prev, [field]: false }))
    }

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
                            <CardTitle className="text-primary">Branch Management</CardTitle>
                            <CardDescription className="text-secondary">
                                Manage cinema branch information
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                            disabled={showCreateForm || editingBranch !== null}
                        >
                            Add Branch
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Branches List */}
            <Card className="border-0">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center">
                            <p className="text-secondary">Loading...</p>
                        </div>
                    ) : branches.length === 0 && !showCreateForm ? (
                        <div className="p-8 text-center">
                            <p className="text-secondary">No branches yet</p>
                        </div>
                    ) : (
                        <div
                            className="rounded-md border border-surface"
                            style={{ overflow: 'visible' }}
                        >
                            <div className="[&>div]:overflow-visible">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px] text-primary">
                                                #
                                            </TableHead>
                                            <TableHead className="text-primary">
                                                Branch Name
                                            </TableHead>
                                            <TableHead className="text-primary">Address</TableHead>
                                            <TableHead className="w-[180px] text-primary">
                                                Created Date
                                            </TableHead>
                                            <TableHead className="w-[180px] text-primary">
                                                Updated Date
                                            </TableHead>
                                            <TableHead className="w-[200px] text-center text-primary">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Create Row */}
                                        {showCreateForm && (
                                            <TableRow>
                                                <TableCell className="font-medium text-primary">
                                                    New
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter branch name..."
                                                        value={formData.name}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'name',
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                            formErrors.name ? 'border-red-500' : ''
                                                        }`}
                                                        autoFocus
                                                        disabled={isCreating}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter address..."
                                                        value={formData.address}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'address',
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`bg-brand border-surface text-primary placeholder:text-secondary ${
                                                            formErrors.address
                                                                ? 'border-red-500'
                                                                : ''
                                                        }`}
                                                        disabled={isCreating}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-brand-secondary text-xs">
                                                    -
                                                </TableCell>
                                                <TableCell className="text-brand-secondary text-xs">
                                                    -
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={handleCreateBranch}
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

                                        {/* Existing Branches */}
                                        {branches.map((branch, index) => (
                                            <TableRow key={branch.id}>
                                                <TableCell className="font-medium text-primary">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {editingBranch?.id === branch.id ? (
                                                        <Input
                                                            type="text"
                                                            value={editFormData.name}
                                                            onChange={(e) =>
                                                                handleEditInputChange(
                                                                    'name',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className={`bg-brand border-surface text-primary ${
                                                                editFormErrors.name
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                            autoFocus
                                                            disabled={isUpdating}
                                                        />
                                                    ) : (
                                                        <span className="font-semibold text-primary">
                                                            {branch.name}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {editingBranch?.id === branch.id ? (
                                                        <Input
                                                            type="text"
                                                            value={editFormData.address}
                                                            onChange={(e) =>
                                                                handleEditInputChange(
                                                                    'address',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className={`bg-brand border-surface text-primary ${
                                                                editFormErrors.address
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                            disabled={isUpdating}
                                                        />
                                                    ) : (
                                                        <span className="text-secondary">
                                                            {branch.address}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-brand-secondary text-xs">
                                                    {formatDate(branch.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-brand-secondary text-xs">
                                                    {formatDate(branch.updatedAt)}
                                                </TableCell>
                                                <TableCell>
                                                    {editingBranch?.id === branch.id ? (
                                                        <div className="flex justify-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={handleUpdateBranch}
                                                                disabled={isUpdating}
                                                                className="btn-primary hover:bg-[#e86d28]"
                                                            >
                                                                {isUpdating ? '...' : '✓'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleCancelEdit}
                                                                disabled={isUpdating}
                                                                className="border-surface text-secondary"
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-center gap-2">
                                                            <div className="relative dropdown-container">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        toggleDropdown(branch.id)
                                                                    }
                                                                    className="border border-surface text-secondary hover:bg-brand hover:text-primary h-8 w-8 p-0 transition-colors"
                                                                    disabled={
                                                                        showCreateForm ||
                                                                        editingBranch !== null
                                                                    }
                                                                >
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>

                                                                {/* Dropdown Menu */}
                                                                {activeDropdown === branch.id && (
                                                                    <div
                                                                        ref={dropdownRef}
                                                                        className="absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1"
                                                                    >
                                                                        {/* Arrow pointing to button */}
                                                                        <div className="absolute -top-2 right-2 w-4 h-4 bg-gray-800 border-t border-l border-gray-700 transform rotate-45 z-[-1]"></div>

                                                                        <button
                                                                            onClick={() =>
                                                                                handleViewRooms(
                                                                                    branch
                                                                                )
                                                                            }
                                                                            className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-green-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                        >
                                                                            <Eye className="w-4 h-4 text-green-400" />
                                                                            View Rooms
                                                                        </button>
                                                                        <div className="border-t border-surface my-1" />
                                                                        <button
                                                                            onClick={() =>
                                                                                handleViewShowTimes(
                                                                                    branch
                                                                                )
                                                                            }
                                                                            className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-purple-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                        >
                                                                            <Calendar className="w-4 h-4 text-purple-400" />
                                                                            View Show Times
                                                                        </button>
                                                                        <div className="border-t border-surface my-1" />
                                                                        <button
                                                                            onClick={() =>
                                                                                handleViewStaffAccounts(
                                                                                    branch
                                                                                )
                                                                            }
                                                                            className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-yellow-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                        >
                                                                            <Users className="w-4 h-4 text-yellow-400" />
                                                                            View Staff Accounts
                                                                        </button>
                                                                        <div className="border-t border-surface my-1" />
                                                                        <button
                                                                            onClick={() => {
                                                                                handleEditBranch(
                                                                                    branch
                                                                                )
                                                                                setActiveDropdown(
                                                                                    null
                                                                                )
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-blue-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                        >
                                                                            <Edit2 className="w-4 h-4 text-blue-400" />
                                                                            Edit
                                                                        </button>
                                                                        <div className="border-t border-surface my-1" />
                                                                        <button
                                                                            onClick={() => {
                                                                                handleDeleteBranch(
                                                                                    branch
                                                                                )
                                                                                setActiveDropdown(
                                                                                    null
                                                                                )
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2 transition-all duration-200 ease-in-out"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default BranchManageForm
