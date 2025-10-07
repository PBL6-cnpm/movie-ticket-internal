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
import React, { useEffect, useState } from 'react'

const BranchManageForm: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
    const [formData, setFormData] = useState<CreateBranchRequest>({
        name: '',
        address: ''
    })
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

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
                alert('Có lỗi xảy ra khi tải danh sách chi nhánh')
            } finally {
                setLoading(false)
            }
        }
        fetchBranches()
    }, [])

    const handleCreateBranch = async () => {
        if (!formData.name.trim() || !formData.address.trim()) {
            alert('Vui lòng nhập đầy đủ thông tin')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await createBranch({
                name: formData.name.trim(),
                address: formData.address.trim()
            })

            if (response.success && response.data) {
                setBranches((prev) => [...prev, response.data])
                setFormData({ name: '', address: '' })
                setIsCreateDialogOpen(false)
                alert('Tạo chi nhánh thành công!')
            } else {
                throw new Error(response.message || 'Failed to create branch')
            }
        } catch (error) {
            console.error('Error creating branch:', error)
            alert('Có lỗi xảy ra khi tạo chi nhánh')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditBranch = async () => {
        if (!selectedBranch || !formData.name.trim() || !formData.address.trim()) {
            alert('Vui lòng nhập đầy đủ thông tin')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await updateBranch(selectedBranch.id, {
                name: formData.name.trim(),
                address: formData.address.trim()
            })

            if (response.success && response.data) {
                setBranches((prev) =>
                    prev.map((branch) => (branch.id === selectedBranch.id ? response.data : branch))
                )
                setFormData({ name: '', address: '' })
                setIsEditDialogOpen(false)
                setSelectedBranch(null)
                alert('Cập nhật chi nhánh thành công!')
            } else {
                throw new Error(response.message || 'Failed to update branch')
            }
        } catch (error) {
            console.error('Error updating branch:', error)
            alert('Có lỗi xảy ra khi cập nhật chi nhánh')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteBranch = async (branch: Branch) => {
        const confirmDelete = window.confirm(
            `Bạn có chắc chắn muốn xóa chi nhánh "${branch.name}"?\n\nHành động này không thể hoàn tác.`
        )

        if (!confirmDelete) return

        try {
            const response = await deleteBranch(branch.id)

            if (response.success) {
                setBranches((prev) => prev.filter((b) => b.id !== branch.id))
                alert(`Chi nhánh "${branch.name}" đã được xóa thành công!`)
            } else {
                throw new Error(response.message || 'Failed to delete branch')
            }
        } catch (error) {
            console.error('Error deleting branch:', error)
            alert('Có lỗi xảy ra khi xóa chi nhánh')
        }
    }

    const openEditDialog = (branch: Branch) => {
        console.log('Opening edit dialog for branch:', branch)
        setSelectedBranch(branch)
        setFormData({
            name: branch.name,
            address: branch.address
        })
        setIsCreateDialogOpen(false) // Ensure create dialog is closed
        setIsEditDialogOpen(true)
        console.log('Edit dialog opened, isEditDialogOpen should be true')
    }

    const openCreateDialog = () => {
        console.log('Opening create dialog')
        setFormData({ name: '', address: '' })
        setSelectedBranch(null) // Clear selected branch
        setIsEditDialogOpen(false) // Ensure edit dialog is closed
        setIsCreateDialogOpen(true)
        console.log('Create dialog opened, isCreateDialogOpen should be true')
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
        <div className="min-h-screen bg-brand p-6">
            <div className="max-w-7xl mx-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <Card className="bg-surface border-surface">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-primary">
                                        Quản lý Chi nhánh
                                    </CardTitle>
                                    <CardDescription className="text-secondary">
                                        Quản lý thông tin các chi nhánh rạp chiếu phim
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={openCreateDialog}
                                    className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                >
                                    Thêm Chi nhánh
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Create/Edit Form */}
                    {(isCreateDialogOpen || isEditDialogOpen) && (
                        <Card className="bg-surface border-surface">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    {isEditDialogOpen ? 'Sửa Chi nhánh' : 'Thêm Chi nhánh Mới'}
                                </CardTitle>
                                <CardDescription className="text-secondary">
                                    {isEditDialogOpen
                                        ? 'Cập nhật thông tin chi nhánh'
                                        : 'Nhập thông tin chi nhánh mới'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-primary block mb-2">
                                            Tên Chi nhánh *
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Nhập tên chi nhánh..."
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    name: e.target.value
                                                }))
                                            }
                                            className="bg-brand border-surface text-primary placeholder:text-secondary"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-primary block mb-2">
                                            Địa chỉ *
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Nhập địa chỉ chi nhánh..."
                                            value={formData.address}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    address: e.target.value
                                                }))
                                            }
                                            className="bg-brand border-surface text-primary placeholder:text-secondary"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-surface">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateDialogOpen(false)
                                            setIsEditDialogOpen(false)
                                            setFormData({ name: '', address: '' })
                                            setSelectedBranch(null)
                                        }}
                                        disabled={isSubmitting}
                                        className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={
                                            isEditDialogOpen ? handleEditBranch : handleCreateBranch
                                        }
                                        disabled={
                                            isSubmitting ||
                                            !formData.name.trim() ||
                                            !formData.address.trim()
                                        }
                                        className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30 min-w-[120px]"
                                    >
                                        {isSubmitting
                                            ? isEditDialogOpen
                                                ? 'Đang cập nhật...'
                                                : 'Đang tạo...'
                                            : isEditDialogOpen
                                              ? 'Cập nhật'
                                              : 'Tạo Chi nhánh'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Branches List */}
                    <Card className="bg-surface border-surface">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <p className="text-secondary">Đang tải...</p>
                                </div>
                            ) : branches.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-secondary">Chưa có chi nhánh nào</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 p-4">
                                    {branches.map((branch) => (
                                        <div
                                            key={branch.id}
                                            className="p-4 bg-brand border border-surface rounded-lg hover:shadow-lg transition-all duration-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-primary text-lg">
                                                        {branch.name}
                                                    </h3>
                                                    <p className="text-secondary mt-2">
                                                        <span className="font-medium">
                                                            Địa chỉ:
                                                        </span>{' '}
                                                        {branch.address}
                                                    </p>
                                                    <div className="flex space-x-4 mt-3 text-xs text-brand-secondary">
                                                        <span>
                                                            Tạo: {formatDate(branch.createdAt)}
                                                        </span>
                                                        <span>
                                                            Cập nhật: {formatDate(branch.updatedAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 ml-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(branch)}
                                                        className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                                    >
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteBranch(branch)}
                                                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default BranchManageForm
