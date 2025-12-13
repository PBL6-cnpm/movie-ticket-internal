import type {
    CreateStaffAccountRequest,
    StaffAccount,
    UpdateStaffAccountRequest
} from '@/features/admin/types/staff-account.types'
import { AccountStatus } from '@/shared/types/account.types'
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
import { cn } from '@/lib/utils'
import { showConfirm } from '@/shared/utils/confirm'
import { showToast } from '@/shared/utils/toast'
import {
    Edit3,
    Loader2,
    MoreHorizontal,
    RefreshCw,
    Search,
    ShieldAlert,
    Trash2,
    UserCog,
    UserPlus,
    XCircle
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface FormData {
    email: string
    password: string
    fullName: string
    phoneNumber: string
    status: AccountStatus
}

interface FormErrors {
    email?: string
    password?: string
    fullName?: string
    phoneNumber?: string
}

const initialFormData: FormData = {
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    status: AccountStatus.ACTIVE
}

const statusStyles: Record<AccountStatus, string> = {
    [AccountStatus.ACTIVE]: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    [AccountStatus.PENDING]: 'bg-amber-500/10 text-amber-200 border-amber-500/30',
    [AccountStatus.DELETED]: 'bg-rose-500/10 text-rose-200 border-rose-500/30'
}

const statusCopy: Record<AccountStatus, string> = {
    [AccountStatus.ACTIVE]: 'Active',
    [AccountStatus.PENDING]: 'Pending',
    [AccountStatus.DELETED]: 'Disabled'
}

const pageSize = 10

const normalizeStatus = (status?: string): AccountStatus => {
    const lower = (status || '').toLowerCase() as AccountStatus
    if (lower === AccountStatus.DELETED || lower === AccountStatus.PENDING) {
        return lower
    }
    return AccountStatus.ACTIVE
}

const formatDate = (date?: string) => {
    if (!date) return '—'
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return '—'
    return parsed.toLocaleDateString()
}

export default function StaffAccountManageForm() {
    const [accounts, setAccounts] = useState<StaffAccount[]>([])
    const [loading, setLoading] = useState(true)
    const [editingAccount, setEditingAccount] = useState<StaffAccount | null>(null)
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [isCreating, setIsCreating] = useState(false)
    const [editFormData, setEditFormData] = useState<FormData>(initialFormData)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [searchInput, setSearchInput] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all')
    const [highlightId, setHighlightId] = useState<string | null>(null)
    const [rowActionId, setRowActionId] = useState<string | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null)
    const actionMenuRef = useRef<HTMLDivElement | null>(null)

    const fetchAccounts = useCallback(async (): Promise<void> => {
        try {
            setLoading(true)
            const offset = Math.max(currentPage - 1, 0) * pageSize
            const response = await staffAccountApi.getAll({
                limit: pageSize,
                offset,
                search: debouncedSearch || undefined
            })

            if (response?.data) {
                setAccounts(response.data.items || [])
                setTotalItems(response.data.meta?.total ?? 0)
            } else {
                setAccounts([])
                setTotalItems(0)
            }
        } catch (error) {
            console.error('Failed to fetch staff accounts:', error)
            showToast.error('Failed to load staff accounts')
        } finally {
            setLoading(false)
        }
    }, [currentPage, debouncedSearch])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350)
        return () => clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    useEffect(() => {
        void fetchAccounts()
    }, [fetchAccounts])

    useEffect(() => {
        if (!highlightId) return
        const timeout = setTimeout(() => setHighlightId(null), 3200)
        return () => clearTimeout(timeout)
    }, [highlightId])

    useEffect(() => {
        if (!openActionMenuId) return
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionMenuId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [openActionMenuId])

    const filteredAccounts = useMemo(() => {
        if (statusFilter === 'all') return accounts
        return accounts.filter((account) => normalizeStatus(account.status) === statusFilter)
    }, [accounts, statusFilter])

    const summaryStats = useMemo(() => {
        const active = accounts.filter(
            (account) => normalizeStatus(account.status) === AccountStatus.ACTIVE
        ).length
        const disabled = accounts.filter(
            (account) => normalizeStatus(account.status) === AccountStatus.DELETED
        ).length
        return {
            total: totalItems,
            active,
            disabled
        }
    }, [accounts, totalItems])

    const validateForm = (data: FormData): FormErrors => {
        const errors: FormErrors = {}

        if (!data.email.trim()) {
            errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Invalid email format'
        }

        if (!data.password.trim()) {
            errors.password = 'Password is required'
        } else if (data.password.length < 8) {
            errors.password = 'Password must be at least 8 characters'
        }

        if (!data.fullName.trim()) {
            errors.fullName = 'Full name is required'
        }

        if (!data.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required'
        } else if (!/^\d{10,11}$/.test(data.phoneNumber)) {
            errors.phoneNumber = 'Phone number must be 10-11 digits'
        }

        return errors
    }

    const closeActionMenu = () => setOpenActionMenuId(null)

    const toggleActionMenu = (accountId: string) => {
        setOpenActionMenuId((prev) => (prev === accountId ? null : accountId))
    }

    const closeEditDialog = () => {
        setIsEditDialogOpen(false)
        setEditingAccount(null)
        setEditFormData(initialFormData)
    }

    const resetCreateForm = () => {
        setFormData(initialFormData)
        setFormErrors({})
    }

    const openCreateDialog = () => {
        resetCreateForm()
        setIsCreateDialogOpen(true)
    }

    const closeCreateDialog = () => {
        resetCreateForm()
        setIsCreateDialogOpen(false)
    }

    const handleCreate = async () => {
        const errors = validateForm(formData)
        setFormErrors(errors)

        if (Object.keys(errors).length) {
            showToast.error('Please fix the highlighted fields')
            return
        }

        try {
            setIsCreating(true)
            const payload: CreateStaffAccountRequest = {
                email: formData.email.trim(),
                password: formData.password.trim(),
                fullName: formData.fullName.trim(),
                phoneNumber: formData.phoneNumber.trim()
            }

            const created = await staffAccountApi.create(payload)
            showToast.success('Staff account created successfully')
            setHighlightId(created.id)
            resetCreateForm()
            await fetchAccounts()
            setCurrentPage(1)
            setSearchInput('')
            setIsCreateDialogOpen(false)
        } catch (error) {
            console.error('Failed to create staff account:', error)
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Failed to create staff account'
            showToast.error(message)
        } finally {
            setIsCreating(false)
        }
    }

    const handleStartEdit = (account: StaffAccount) => {
        closeActionMenu()
        setEditingAccount(account)
        setEditFormData({
            email: account.email,
            password: '',
            fullName: account.fullName,
            phoneNumber: account.phoneNumber || '',
            status: normalizeStatus(account.status)
        })
        setIsEditDialogOpen(true)
    }

    const performStatusUpdate = async (
        id: string,
        nextStatus: AccountStatus,
        successMessage: string
    ) => {
        try {
            setRowActionId(id)
            const payload: UpdateStaffAccountRequest = {
                status: nextStatus
            }
            await staffAccountApi.update(id, payload)
            showToast.success(successMessage)
            await fetchAccounts()
        } catch (error) {
            console.error('Failed to update staff account:', error)
            showToast.error('Failed to update staff account')
        } finally {
            setRowActionId(null)
        }
    }

    const handleSaveEdit = async () => {
        if (!editingAccount) return
        setIsUpdating(true)
        await performStatusUpdate(
            editingAccount.id,
            editFormData.status,
            'Staff status updated successfully'
        )
        setIsUpdating(false)
        closeEditDialog()
    }

    const handleToggleStatus = (account: StaffAccount) => {
        closeActionMenu()
        const currentStatus = normalizeStatus(account.status)
        const nextStatus =
            currentStatus === AccountStatus.ACTIVE ? AccountStatus.DELETED : AccountStatus.ACTIVE
        const label = nextStatus === AccountStatus.ACTIVE ? 're-activated' : 'disabled'
        void performStatusUpdate(account.id, nextStatus, `Staff account ${label}`)
    }

    const handleDeleteAccount = (account: StaffAccount) => {
        closeActionMenu()
        showConfirm({
            title: 'Deactivate staff account',
            message: `“${account.fullName}” will immediately lose access. You can re-enable the account later if needed.`,
            confirmText: 'Deactivate',
            confirmButtonColor: '#dc2626',
            onConfirm: async () => {
                await performStatusUpdate(
                    account.id,
                    AccountStatus.DELETED,
                    'Staff account deactivated'
                )
                if (isEditDialogOpen && editingAccount?.id === account.id) {
                    closeEditDialog()
                }
            }
        })
    }

    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1)
    const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endIndex = Math.min(currentPage * pageSize, totalItems)

    return (
        <div className="px-6 py-8 space-y-8">
            <section className="rounded-3xl border border-white/5 bg-gradient-to-r from-[#0b1120] via-[#13203d] to-[#1f1538] p-6 text-white shadow-2xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div className="flex-1 space-y-3">
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                            Employee Console
                        </p>
                        <h1 className="text-3xl font-semibold">Staff Account Management</h1>
                        <p className="text-white/70 max-w-2xl">
                            Onboard new team members, adjust access levels, and gracefully retire
                            staff tied to your cinema branches. Every change syncs in real time with
                            branch permissions.
                        </p>
                    </div>
                    <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-[420px]">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                            <p className="text-xs uppercase tracking-wide text-white/70">
                                Total staff
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                                <UserCog className="h-5 w-5 text-white/70" />
                                <span>{summaryStats.total}</span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-emerald-200">
                                Active (page)
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
                                <ShieldAlert className="h-5 w-5 text-emerald-200" />
                                <span>{summaryStats.active}</span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-rose-200">
                                Disabled (page)
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
                                <Trash2 className="h-5 w-5 text-rose-200" />
                                <span>{summaryStats.disabled}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="space-y-6">
                <Card className="border border-white/10 bg-[#050a16] text-white shadow-xl">
                    <CardHeader className="space-y-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle>Staff directory</CardTitle>
                                <CardDescription className="text-white/60">
                                    Search, filter and take quick actions on existing employees.
                                </CardDescription>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                    <Input
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Search name or email"
                                        className="w-full rounded-xl border-white/10 bg-[#0d1426] pl-10 text-white placeholder:text-white/30"
                                    />
                                    {searchInput && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchInput('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <Button variant="outline" onClick={() => fetchAccounts()}>
                                    <RefreshCw className="h-4 w-4" /> Refresh
                                </Button>
                                <Button onClick={openCreateDialog}>
                                    <UserPlus className="h-4 w-4" /> Add staff
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs uppercase tracking-wide text-white/50">
                                Status
                            </span>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    setStatusFilter(value as 'all' | AccountStatus)
                                }
                            >
                                <SelectTrigger className="w-40 border-white/10 bg-[#0d1426] text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-white/10 bg-[#0d1426] text-white">
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value={AccountStatus.ACTIVE}>Active</SelectItem>
                                    <SelectItem value={AccountStatus.DELETED}>Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="py-16 text-center text-white/50">
                                <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" /> Loading
                                staff accounts...
                            </div>
                        ) : filteredAccounts.length === 0 ? (
                            <div className="py-16 text-center text-white/50">
                                No staff accounts match your filters.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-left">#</TableHead>
                                            <TableHead className="text-left">Name</TableHead>
                                            <TableHead className="text-left">Contact</TableHead>
                                            <TableHead className="text-left">Joined</TableHead>
                                            <TableHead className="text-left">Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAccounts.map((account, index) => {
                                            const normalizedStatus = normalizeStatus(account.status)
                                            const isRowBusy = rowActionId === account.id
                                            return (
                                                <TableRow
                                                    key={account.id}
                                                    className={cn(
                                                        'border-white/5 transition-colors',
                                                        highlightId === account.id &&
                                                            'bg-[#fe7e32]/5'
                                                    )}
                                                >
                                                    <TableCell>
                                                        {(currentPage - 1) * pageSize + index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-white">
                                                            {account.fullName}
                                                        </div>
                                                        <div className="text-sm text-white/60">
                                                            {account.email}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-white">
                                                            {account.phoneNumber || '—'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-white">
                                                            {formatDate(account.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={cn(
                                                                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                                                                statusStyles[normalizedStatus]
                                                            )}
                                                        >
                                                            {statusCopy[normalizedStatus]}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div
                                                            className="relative flex justify-end"
                                                            ref={
                                                                openActionMenuId === account.id
                                                                    ? actionMenuRef
                                                                    : undefined
                                                            }
                                                        >
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 border-white/20 text-white/70 hover:text-white"
                                                                onClick={() =>
                                                                    toggleActionMenu(account.id)
                                                                }
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                            {openActionMenuId === account.id && (
                                                                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0f172a] p-1 text-left shadow-2xl">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleStartEdit(account)
                                                                        }
                                                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white transition-colors hover:bg-white/5"
                                                                    >
                                                                        <Edit3 className="h-4 w-4 text-blue-300" />
                                                                        Edit account
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={isRowBusy}
                                                                        onClick={() =>
                                                                            handleToggleStatus(
                                                                                account
                                                                            )
                                                                        }
                                                                        className={cn(
                                                                            'mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                                                                            normalizedStatus ===
                                                                                AccountStatus.ACTIVE
                                                                                ? 'text-rose-200 hover:bg-rose-500/10'
                                                                                : 'text-emerald-200 hover:bg-emerald-500/10',
                                                                            isRowBusy &&
                                                                                'cursor-not-allowed opacity-60'
                                                                        )}
                                                                    >
                                                                        {isRowBusy ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <ShieldAlert className="h-4 w-4" />
                                                                        )}
                                                                        {normalizedStatus ===
                                                                        AccountStatus.ACTIVE
                                                                            ? 'Disable account'
                                                                            : 'Enable account'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={isRowBusy}
                                                                        onClick={() =>
                                                                            handleDeleteAccount(
                                                                                account
                                                                            )
                                                                        }
                                                                        className={cn(
                                                                            'mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-200 transition-colors hover:bg-rose-500/10',
                                                                            isRowBusy &&
                                                                                'cursor-not-allowed opacity-60'
                                                                        )}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />{' '}
                                                                        Remove account
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <div className="flex flex-col gap-3 border-t border-white/5 px-6 py-4 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
                            <span>
                                Showing {startIndex}-{endIndex} of {totalItems} results
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-white/80">
                                    Page {Math.min(currentPage, totalPages)} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                    disabled={currentPage >= totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isEditDialogOpen && editingAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
                    <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0a0f1d] p-6 text-white shadow-2xl">
                        <button
                            type="button"
                            onClick={closeEditDialog}
                            className="absolute right-4 top-4 text-white/60 hover:text-white"
                        >
                            <XCircle className="h-5 w-5" />
                        </button>
                        <div className="space-y-2 pr-8">
                            <h2 className="text-2xl font-semibold">Update staff access</h2>
                            <p className="text-white/60">
                                Editing {editingAccount.fullName} ({editingAccount.email})
                            </p>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={editFormData.email}
                                    disabled
                                    className="bg-[#10172b]/60"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Full name</Label>
                                <Input
                                    value={editFormData.fullName}
                                    disabled
                                    className="bg-[#10172b]/60"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone number</Label>
                                <Input
                                    value={editFormData.phoneNumber}
                                    disabled
                                    className="bg-[#10172b]/60"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Account status</Label>
                                <Select
                                    value={editFormData.status}
                                    onValueChange={(value) =>
                                        setEditFormData((prev) => ({
                                            ...prev,
                                            status: value as AccountStatus
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full border-white/10 bg-[#10172b] text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/10 bg-[#0d1426] text-white">
                                        <SelectItem value={AccountStatus.ACTIVE}>Active</SelectItem>
                                        <SelectItem value={AccountStatus.DELETED}>
                                            Disabled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                disabled={isUpdating}
                                onClick={handleSaveEdit}
                                className="w-full"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Edit3 className="h-4 w-4" /> Save changes
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full"
                                onClick={() =>
                                    editingAccount && handleDeleteAccount(editingAccount)
                                }
                            >
                                <Trash2 className="h-4 w-4" /> Deactivate account
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isCreateDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
                    <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0a0f1d] p-6 text-white shadow-2xl">
                        <button
                            type="button"
                            onClick={closeCreateDialog}
                            className="absolute right-4 top-4 text-white/60 hover:text-white"
                        >
                            <XCircle className="h-5 w-5" />
                        </button>
                        <div className="space-y-2 pr-8">
                            <h2 className="text-2xl font-semibold">Invite new staff</h2>
                            <p className="text-white/60">
                                Fill in the basics and we will email temporary credentials
                                instantly.
                            </p>
                        </div>
                        <div className="mt-6 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full name</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fullName: e.target.value })
                                    }
                                    placeholder="Nguyen Van A"
                                    className={cn(
                                        'bg-[#10172b] border-white/10 text-white placeholder:text-white/40',
                                        formErrors.fullName && 'border-red-500'
                                    )}
                                />
                                {formErrors.fullName && (
                                    <p className="text-xs text-red-400">{formErrors.fullName}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="staff@cinestech.me"
                                    className={cn(
                                        'bg-[#10172b] border-white/10 text-white placeholder:text-white/40',
                                        formErrors.email && 'border-red-500'
                                    )}
                                />
                                {formErrors.email && (
                                    <p className="text-xs text-red-400">{formErrors.email}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phoneNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phoneNumber: e.target.value })
                                    }
                                    placeholder="0901 234 567"
                                    className={cn(
                                        'bg-[#10172b] border-white/10 text-white placeholder:text-white/40',
                                        formErrors.phoneNumber && 'border-red-500'
                                    )}
                                />
                                {formErrors.phoneNumber && (
                                    <p className="text-xs text-red-400">{formErrors.phoneNumber}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    placeholder="At least 8 characters"
                                    className={cn(
                                        'bg-[#10172b] border-white/10 text-white placeholder:text-white/40',
                                        formErrors.password && 'border-red-500'
                                    )}
                                />
                                {formErrors.password && (
                                    <p className="text-xs text-red-400">{formErrors.password}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    disabled={isCreating}
                                    onClick={handleCreate}
                                    className="flex-1"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" /> Create staff
                                        </>
                                    )}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetCreateForm}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
