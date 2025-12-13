import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, MoreHorizontal, Search, Shield, User, XCircle } from 'lucide-react'

import { getUserAccounts, updateUserAccountStatus } from '@/shared/api/account-api'
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
import { AccountStatus, type UserAccount } from '@/shared/types/account.types'
import { showConfirm } from '@/shared/utils/confirm'
import { showToast } from '@/shared/utils/toast'

interface UserAccountsManagerProps {
    title: string
    description: string
    detailRouteBase: string
}

const PAGE_SIZE = 10

const statusStyles: Record<AccountStatus, string> = {
    [AccountStatus.ACTIVE]: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    [AccountStatus.DELETED]: 'bg-rose-500/10 text-rose-200 border-rose-500/30',
    [AccountStatus.PENDING]: 'bg-amber-500/10 text-amber-200 border-amber-500/30'
}

const UserAccountsManager = ({ title, description, detailRouteBase }: UserAccountsManagerProps) => {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState<UserAccount[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [searchInput, setSearchInput] = useState('')
    const [searchKeyword, setSearchKeyword] = useState('')
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null)
    const [openMenuAccountId, setOpenMenuAccountId] = useState<string | null>(null)
    const dropdownContainerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownContainerRef.current &&
                !dropdownContainerRef.current.contains(event.target as Node)
            ) {
                setOpenMenuAccountId(null)
            }
        }

        if (openMenuAccountId) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [openMenuAccountId])

    const fetchAccounts = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getUserAccounts({
                limit: PAGE_SIZE,
                offset: (currentPage - 1) * PAGE_SIZE,
                search: searchKeyword || undefined
            })

            if (response.success && response.data) {
                setAccounts(response.data.items || [])
                setTotalItems(response.data.meta?.total ?? response.data.items?.length ?? 0)
            } else {
                setAccounts([])
                setTotalItems(0)
            }
        } catch (error) {
            console.error('Failed to load user accounts:', error)
            showToast.error('Failed to load user accounts')
        } finally {
            setLoading(false)
        }
    }, [currentPage, searchKeyword])

    useEffect(() => {
        void fetchAccounts()
    }, [fetchAccounts])

    const totalPages = useMemo(() => {
        if (totalItems === 0) {
            return 0
        }
        return Math.ceil(totalItems / PAGE_SIZE)
    }, [totalItems])

    const summaryStats = useMemo(() => {
        const active = accounts.filter((account) => account.status === AccountStatus.ACTIVE).length
        const disabled = accounts.filter(
            (account) => account.status === AccountStatus.DELETED
        ).length
        return {
            total: totalItems,
            active,
            disabled
        }
    }, [accounts, totalItems])

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setCurrentPage(1)
        setSearchKeyword(searchInput.trim())
    }

    const handleResetFilters = () => {
        setSearchInput('')
        setSearchKeyword('')
        setCurrentPage(1)
    }

    const toggleActionMenu = (accountId: string) => {
        setOpenMenuAccountId((prev) => (prev === accountId ? null : accountId))
    }

    const handleViewDetails = (account: UserAccount) => {
        setOpenMenuAccountId(null)
        navigate({ to: `${detailRouteBase}/${account.id}` })
    }

    const handleStatusUpdate = useCallback(
        async (accountId: string, nextStatus: AccountStatus) => {
            try {
                setStatusUpdating(accountId)
                const response = await updateUserAccountStatus(accountId, nextStatus)

                if (response.success) {
                    showToast.success(
                        nextStatus === AccountStatus.DELETED
                            ? 'Account disabled successfully'
                            : 'Account reactivated successfully'
                    )
                    await fetchAccounts()
                } else {
                    showToast.error('Failed to update account status')
                }
            } catch (error) {
                console.error('Failed to update user account status:', error)
                showToast.error('Failed to update account status')
            } finally {
                setStatusUpdating(null)
            }
        },
        [fetchAccounts]
    )

    const handleToggleStatus = (account: UserAccount) => {
        setOpenMenuAccountId(null)
        const nextStatus =
            account.status === AccountStatus.ACTIVE ? AccountStatus.DELETED : AccountStatus.ACTIVE

        const actionLabel = nextStatus === AccountStatus.DELETED ? 'Disable' : 'Enable'
        const targetName = account.fullName || account.email

        showConfirm({
            title: `${actionLabel} account`,
            message: `Are you sure you want to ${actionLabel.toLowerCase()} ${targetName}?`,
            confirmText: actionLabel,
            confirmButtonColor: nextStatus === AccountStatus.DELETED ? '#dc2626' : '#15803d',
            onConfirm: () => {
                void handleStatusUpdate(account.id, nextStatus)
            }
        })
    }

    const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
    const endIndex = Math.min(currentPage * PAGE_SIZE, totalItems)

    return (
        <div className="px-6 py-8 space-y-8">
            <section className="rounded-3xl border border-white/5 bg-gradient-to-r from-[#0b1120] via-[#13203d] to-[#1f1538] p-6 text-white shadow-2xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div className="flex-1 space-y-3">
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                            Customer Console
                        </p>
                        <h1 className="text-3xl font-semibold">{title}</h1>
                        <p className="max-w-2xl text-white/70">{description}</p>
                    </div>
                    <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-[420px]">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                            <p className="text-xs uppercase tracking-wide text-white/70">
                                Total users
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                                <User className="h-5 w-5 text-white/70" />
                                <span>{summaryStats.total}</span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-emerald-200">
                                Active (page)
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
                                <Shield className="h-5 w-5 text-emerald-200" />
                                <span>{summaryStats.active}</span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-rose-200">
                                Disabled (page)
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
                                <Shield className="h-5 w-5 text-rose-200" />
                                <span>{summaryStats.disabled}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Card className="border border-white/10 bg-[#050a16] text-white shadow-xl">
                <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle>Customer directory</CardTitle>
                            <CardDescription className="text-white/60">
                                {description}
                            </CardDescription>
                        </div>
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
                        >
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                <Input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Search by name or email"
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
                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>
                                    Search
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleResetFilters}
                                    disabled={loading || (!searchKeyword && !searchInput)}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-16 text-center text-white/50">
                            Loading user accounts...
                        </div>
                    ) : accounts.length === 0 ? (
                        <div className="py-16 text-center text-white/50">
                            No user accounts found. Try adjusting your filters.
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 text-sm text-white/60">
                                <span>
                                    Showing {startIndex}-{endIndex} of {totalItems} results
                                </span>
                                {searchKeyword && (
                                    <span className="text-xs text-white/80">
                                        Filtered by “{searchKeyword}”
                                    </span>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-left">#</TableHead>
                                            <TableHead className="text-left">Full Name</TableHead>
                                            <TableHead className="text-left">Email</TableHead>
                                            <TableHead className="text-left">Phone</TableHead>
                                            <TableHead className="text-left">Branch</TableHead>
                                            <TableHead className="text-left">Status</TableHead>
                                            <TableHead className="text-left">Created At</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accounts.map((account, index) => (
                                            <TableRow
                                                key={account.id}
                                                className="border-white/5 text-white transition-colors"
                                            >
                                                <TableCell className="text-white/80">
                                                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium text-white">
                                                    {account.fullName || '—'}
                                                </TableCell>
                                                <TableCell className="text-white">
                                                    {account.email}
                                                </TableCell>
                                                <TableCell className="text-white">
                                                    {account.phoneNumber || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {account.branchName || account.branchId ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-white">
                                                                {account.branchName ||
                                                                    account.branchId}
                                                            </span>
                                                            {account.branchAddress && (
                                                                <span className="text-xs text-white/60 truncate max-w-[180px]">
                                                                    {account.branchAddress}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-white/60">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                                                            statusStyles[account.status] ||
                                                            'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}
                                                    >
                                                        {account.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-white">
                                                    {new Date(
                                                        account.createdAt
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div
                                                        className="relative flex justify-end"
                                                        ref={
                                                            openMenuAccountId === account.id
                                                                ? dropdownContainerRef
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

                                                        {openMenuAccountId === account.id && (
                                                            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0f172a] p-1 text-left shadow-2xl">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleViewDetails(account)
                                                                    }
                                                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white transition-colors hover:bg-white/5"
                                                                >
                                                                    <User className="h-4 w-4 text-blue-300" />
                                                                    View details
                                                                </button>
                                                                <div className="my-1 h-px bg-white/5" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleToggleStatus(account)
                                                                    }
                                                                    disabled={
                                                                        statusUpdating ===
                                                                        account.id
                                                                    }
                                                                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                                                                        account.status ===
                                                                        AccountStatus.ACTIVE
                                                                            ? 'text-rose-200 hover:bg-rose-500/15'
                                                                            : 'text-emerald-200 hover:bg-emerald-500/15'
                                                                    } ${
                                                                        statusUpdating ===
                                                                        account.id
                                                                            ? 'cursor-not-allowed opacity-70'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {statusUpdating ===
                                                                    account.id ? (
                                                                        <>
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                            Updating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Shield className="h-4 w-4" />
                                                                            {account.status ===
                                                                            AccountStatus.ACTIVE
                                                                                ? 'Disable account'
                                                                                : 'Enable account'}
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex flex-col gap-3 border-t border-white/5 px-6 py-4 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
                                    <span>
                                        Page {currentPage} of {totalPages}
                                    </span>
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
                                                                <span className="px-2 text-white/60">
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

export default UserAccountsManager
