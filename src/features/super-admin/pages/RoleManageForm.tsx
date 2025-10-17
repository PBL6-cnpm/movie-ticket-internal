import type { PermissionInRole, Role } from '@/features/auth/types/role.type'
import { cn } from '@/lib/utils'
import { getPermissionByRoleId, savePermissionByRoleId } from '@/shared/api/permission-api'
import { createNewRole, deleteRole, getAllRole } from '@/shared/api/role-api'
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
import { showDeleteConfirm } from '@/shared/utils/confirm'
import { showToast } from '@/shared/utils/toast'
import React, { useEffect, useState } from 'react'

const RoleManageForm: React.FC = () => {
    const [selectedRoleId, setSelectedRoleId] = useState<string>('')
    const [selectedRoleName, setSelectedRoleName] = useState<string>('') // Add this line
    const [rolePermissions, setRolePermissions] = useState<string[]>([])
    const [hasChanges, setHasChanges] = useState<boolean>(false)
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [apiPermissions, setApiPermissions] = useState<PermissionInRole[]>([])
    const [newRoleName, setNewRoleName] = useState<string>('')
    const [isDeletingRole, setIsDeletingRole] = useState<boolean>(false)

    // Function to group API permissions by module (based on first word of permission name)
    const getApiPermissionsByModule = () => {
        const grouped: Record<string, PermissionInRole[]> = {}

        apiPermissions.forEach((permission) => {
            // Extract module from permission name (first word before underscore)
            const moduleName = permission.name.split('_')[0] || 'other'

            if (!grouped[moduleName]) {
                grouped[moduleName] = []
            }
            grouped[moduleName].push(permission)
        })

        return grouped
    }

    // Get grouped permissions from API data
    const displayPermissionsByModule = getApiPermissionsByModule()

    // Fetch roles from API on component mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true)
                const response = await getAllRole()
                const data = response.data

                if (!data || !data.data) return

                const apiRoles: Role[] = data.data.map((role: { id: string; name: string }) => ({
                    roleId: role.id,
                    roleName: role.name
                }))

                setRoles(apiRoles)

                if (apiRoles.length > 0) {
                    setSelectedRoleId(apiRoles[0].roleId)
                    setSelectedRoleName(apiRoles[0].roleName) // Add this line to set role name
                }
                console.log('Loaded roles:', apiRoles)
            } catch (error) {
                console.log('Error to get roles: ' + error)
            } finally {
                setLoading(false)
            }
        }
        fetchRoles()
    }, [])

    // Update permissions when role is selected
    useEffect(() => {
        if (selectedRoleId) {
            const fetchPermissionByRoleId = async (id: string) => {
                try {
                    const response = await getPermissionByRoleId(id)
                    const data = response.data

                    if (!data || !data.data) return

                    const permissionInRoleResponse: PermissionInRole[] = data.data

                    // Set API permissions data
                    setApiPermissions(permissionInRoleResponse)

                    // Extract permission IDs chỉ cho những permissions có isHas: true
                    const grantedPermissionIds = permissionInRoleResponse
                        .filter((p) => p.isHas) // Chỉ lấy những permission được grant
                        .map((p) => p.id.toString())

                    setRolePermissions(grantedPermissionIds)
                    setHasChanges(false)

                    // console.log('Loaded permissions for role:', permissionInRoleResponse)
                    // console.log('Granted permissions:', grantedPermissionIds)

                    // console.log('Loaded permissions for role:', permissionInRoleResponse)
                } catch (error) {
                    console.log('Error fetching permissions:', error)
                    // Fallback to empty permissions
                    setApiPermissions([])
                    setRolePermissions([])
                    setHasChanges(false)
                }
            }

            fetchPermissionByRoleId(selectedRoleId)
        }
    }, [selectedRoleId])

    const handleRoleChange = (roleId: string) => {
        setSelectedRoleId(roleId)

        // Find and store the role name
        const selectedRoleObj = roles.find((role) => role.roleId === roleId)
        if (selectedRoleObj) {
            setSelectedRoleName(selectedRoleObj.roleName)
        }
    }

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        // Update API permissions data if available
        if (apiPermissions && apiPermissions.length > 0) {
            const updatedApiPermissions = apiPermissions.map((permission) => {
                if (permission.id.toString() === permissionId) {
                    return { ...permission, isHas: checked }
                }
                return permission
            })
            setApiPermissions(updatedApiPermissions)
        }

        // Also update rolePermissions array for fallback compatibility
        let newPermissions: string[]
        if (checked) {
            newPermissions = [...rolePermissions, permissionId]
        } else {
            newPermissions = rolePermissions.filter((id) => id !== permissionId)
        }

        setRolePermissions(newPermissions)
        setHasChanges(true)
    }

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            showToast.warning('Please enter role name')
            return
        }

        try {
            console.log('Creating new role:', newRoleName)

            const response = await createNewRole(newRoleName.trim())

            if (!response) {
                console.error('Error creating role')
                showToast.error('An error occurred while creating role')
            }

            if (!response.data && !response.data.success) {
                console.error('Error creating role')
                showToast.error('An error occurred while creating role')
            }

            const roleResponse = response.data.data

            const newRole: Role = {
                roleId: roleResponse.id,
                roleName: roleResponse.name
            }

            setRoles((prevRoles) => [...prevRoles, newRole])
            setNewRoleName('')

            showToast.success(`Role "${newRole.roleName}" has been created successfully!`)

            // Auto-select the new role
            setSelectedRoleId(newRole.roleId)
            setSelectedRoleName(newRole.roleName)
        } catch (error) {
            console.error('Error creating role:', error)
            showToast.error('An error occurred while creating role')
        }
    }

    const handleDeleteRole = async () => {
        if (!selectedRoleId || !selectedRoleName) {
            showToast.warning('Please select a role to delete')
            return
        }

        // Confirm deletion
        showDeleteConfirm({
            title: 'Delete Role',
            message: '',
            itemName: selectedRoleName,
            onConfirm: async () => {
                setIsDeletingRole(true)
                try {
                    // Simulate API call - replace with actual deleteRole API call
                    console.log('Deleting role:', selectedRoleId, selectedRoleName)

                    console.log(selectedRoleId)

                    const response = await deleteRole(selectedRoleId)

                    console.log(response)

                    // Remove role from local state
                    const updatedRoles = roles.filter((role) => role.roleId !== selectedRoleId)
                    setRoles(updatedRoles)

                    // Select first role if available, otherwise clear
                    if (updatedRoles.length > 0) {
                        setSelectedRoleId(updatedRoles[0].roleId)
                        setSelectedRoleName(updatedRoles[0].roleName)
                    } else {
                        setSelectedRoleId('')
                        setSelectedRoleName('')
                        setApiPermissions([])
                        setRolePermissions([])
                    }
                    setHasChanges(false)

                    showToast.success(`Role "${selectedRoleName}" has been deleted successfully!`)
                } catch (error) {
                    console.error('Error deleting role:', error)
                    showToast.error('An error occurred while deleting role')
                } finally {
                    setIsDeletingRole(false)
                }
            }
        })
    }

    const handleSaveChanges = async () => {
        if (!selectedRoleId) return

        // Here you would typically make an API call to save changes
        const dataUpdatePermissionByRoleId = {
            roleId: selectedRoleId,
            detailedPermissions: apiPermissions.map(
                (permission) =>
                    ({
                        id: permission.id,
                        name: permission.name,
                        isHas: permission.isHas
                    }) as PermissionInRole
            )
        }

        const response = await savePermissionByRoleId(
            dataUpdatePermissionByRoleId.roleId,
            dataUpdatePermissionByRoleId.detailedPermissions
        )

        if (response && response.data && response.data.success) {
            // Show success message with role name
            showToast.success(`Permissions updated for role: ${selectedRoleName}`)
            setHasChanges(false)
        }
    }

    const handleResetChanges = () => {
        if (selectedRoleId) {
            // Re-fetch permissions from API to reset to original state
            const fetchPermissionByRoleId = async (id: string) => {
                try {
                    const response = await getPermissionByRoleId(id)
                    const data = response.data

                    if (!data || !data.data) return

                    const permissionInRoleResponse: PermissionInRole[] = data.data

                    // Reset API permissions data
                    setApiPermissions(permissionInRoleResponse)

                    // Reset permission IDs chỉ cho những permissions có isHas: true
                    const grantedPermissionIds = permissionInRoleResponse
                        .filter((p) => p.isHas) // Chỉ lấy những permission được grant
                        .map((p) => p.id.toString())
                    setRolePermissions(grantedPermissionIds)
                    setHasChanges(false)
                } catch (error) {
                    console.log('Error resetting permissions:', error)
                    // Reset to empty state on error
                    setApiPermissions([])
                    setRolePermissions([])
                    setHasChanges(false)
                }
            }

            fetchPermissionByRoleId(selectedRoleId)
        }
    }

    const isPermissionGranted = (permissionId: string): boolean => {
        // Check if we have API permission data with isHas property
        if (apiPermissions && apiPermissions.length > 0) {
            const apiPermission = apiPermissions.find((p) => p.id.toString() === permissionId)
            if (apiPermission) {
                return apiPermission.isHas
            }
        }

        // Fallback to original logic for mock data
        return rolePermissions.includes(permissionId)
    }

    const selectedRole = selectedRoleId
        ? roles.find((role) => role.roleId === selectedRoleId)
        : null

    return (
        <div className="space-y-6">
            {/* Role Selection */}
            <Card className="bg-surface border-surface">
                <CardHeader>
                    <CardTitle className="text-primary">Role & Permissions Management</CardTitle>
                    <CardDescription className="text-secondary">
                        Select a role and update permissions for each role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-primary block mb-2">
                                Select Role
                            </label>
                            <Select
                                value={selectedRoleId}
                                onValueChange={handleRoleChange}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-full max-w-md bg-brand border-surface text-primary hover:bg-[#1f2937] transition-colors">
                                    <SelectValue
                                        placeholder={
                                            loading ? 'Loading...' : '-- Select a role to manage --'
                                        }
                                        className="text-secondary"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-surface border-surface">
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role.roleId}
                                            value={role.roleId}
                                            className="hover:bg-brand focus:bg-brand"
                                        >
                                            <div>
                                                <div className="font-medium text-primary">
                                                    {role.roleName}
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Create New Role Section */}
                        <div className="border-t border-surface pt-4">
                            <label className="text-sm font-medium text-primary block mb-2">
                                Or create a new role
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="Enter new role name..."
                                    className="flex-1 bg-brand border-surface text-primary placeholder:text-secondary"
                                />
                                <Button
                                    onClick={handleCreateRole}
                                    disabled={!newRoleName.trim() || loading}
                                    className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                >
                                    Create
                                </Button>
                            </div>
                        </div>

                        {selectedRole && (
                            <div className="p-4 bg-brand border border-primary/20">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-brand-primary">
                                            {selectedRole.roleName}
                                        </h4>
                                        <p className="text-xs text-brand-secondary mt-2">
                                            Currently has{' '}
                                            {apiPermissions.filter((p) => p.isHas).length ||
                                                rolePermissions.length}{' '}
                                            permissions granted
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeleteRole}
                                        disabled={isDeletingRole}
                                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white ml-4"
                                    >
                                        {isDeletingRole ? 'Deleting...' : 'Delete Role'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Permissions Management */}
            {selectedRole && (
                <Card className="bg-surface border-surface">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-primary">
                                    Permissions List - {selectedRole.roleName}
                                </CardTitle>
                                <CardDescription className="text-secondary">
                                    Tick/untick to grant or revoke permissions
                                </CardDescription>
                            </div>
                            {hasChanges && (
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetChanges}
                                        className="border-surface text-secondary hover:bg-brand hover:text-primary"
                                    >
                                        Cancel changes
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveChanges}
                                        className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                    >
                                        Save changes
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {Object.entries(displayPermissionsByModule).map(
                                ([module, permissions]) => (
                                    <div
                                        key={module}
                                        className="border border-surface p-4 bg-brand"
                                    >
                                        <h3 className="font-semibold text-primary mb-4 flex items-center">
                                            <div className="w-2 h-2 bg-brand-primary rounded-full mr-2"></div>
                                            {module.charAt(0).toUpperCase() + module.slice(1)}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {(permissions as PermissionInRole[]).map(
                                                (permission) => {
                                                    // Handle both API and mock permission formats
                                                    const permissionId =
                                                        permission.id?.toString() || permission.id
                                                    const permissionName = permission.name

                                                    return (
                                                        <div
                                                            key={`${module}-${permissionId}`}
                                                            className={cn(
                                                                'flex items-start space-x-3 p-3 transition-all duration-200 border cursor-pointer group',
                                                                isPermissionGranted(permissionId)
                                                                    ? 'bg-[#e86d28]/10 border-[#e86d28]/30 hover:bg-[#e86d28]/20 hover:border-[#e86d28]/50 shadow-sm'
                                                                    : 'bg-surface border-surface hover:bg-brand hover:shadow-md'
                                                            )}
                                                            onClick={() =>
                                                                handlePermissionChange(
                                                                    permissionId,
                                                                    !isPermissionGranted(
                                                                        permissionId
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <Checkbox
                                                                id={permissionId}
                                                                checked={isPermissionGranted(
                                                                    permissionId
                                                                )}
                                                                onCheckedChange={(checked) =>
                                                                    handlePermissionChange(
                                                                        permissionId,
                                                                        checked as boolean
                                                                    )
                                                                }
                                                                className="mt-0.5 pointer-events-none"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <label
                                                                    htmlFor={permissionId}
                                                                    className={cn(
                                                                        'text-sm font-medium cursor-pointer block transition-colors',
                                                                        isPermissionGranted(
                                                                            permissionId
                                                                        )
                                                                            ? 'text-[#e86d28] group-hover:text-[#d35f1a]'
                                                                            : 'text-primary group-hover:text-primary'
                                                                    )}
                                                                >
                                                                    {permissionName}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {hasChanges && (
                            <div className="mt-6 p-4 bg-brand border border-primary/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-brand-primary rounded-full mr-2"></div>
                                        <span className="text-sm font-medium text-brand-primary">
                                            Có thay đổi chưa được lưu
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResetChanges}
                                            className="border-surface text-secondary hover:bg-surface hover:text-primary"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSaveChanges}
                                            className="btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30"
                                        >
                                            Lưu thay đổi
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {!selectedRole && (
                <Card className="bg-surface border-surface">
                    <CardContent className="py-12">
                        <div className="text-center">
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
                                        d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-5a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-primary mb-2">
                                No role selected
                            </h3>
                            <p className="text-secondary">
                                Please select a role from the dropdown above to start managing
                                permissions
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default RoleManageForm
