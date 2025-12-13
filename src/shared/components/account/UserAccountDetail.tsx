import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
    ArrowLeft,
    CalendarDays,
    Film,
    Loader2,
    MapPin,
    Phone,
    QrCode,
    Ticket,
    User,
    Wallet
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { getUserAccountDetail } from '@/shared/api/account-api'
import Button from '@/shared/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/shared/components/ui/card'
import type { UserAccount } from '@/shared/types/account.types'
import { AccountStatus } from '@/shared/types/account.types'
import { BookingStatus, type BookingHistoryItem } from '@/shared/types/booking.types'
import { showToast } from '@/shared/utils/toast'

interface UserAccountDetailProps {
    accountId: string
    title: string
    description: string
    backHref: string
}

const PAGE_SIZE = 6

const statusAccent: Record<AccountStatus, string> = {
    [AccountStatus.ACTIVE]: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40',
    [AccountStatus.DELETED]: 'bg-rose-500/15 text-rose-200 border border-rose-400/40',
    [AccountStatus.PENDING]: 'bg-amber-500/15 text-amber-200 border border-amber-400/40'
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value)

const formatDateTime = (value?: string) => {
    if (!value) return '—'
    try {
        return format(new Date(value), 'dd MMM yyyy • HH:mm')
    } catch {
        return value
    }
}

const UserAccountDetail = ({ accountId, title, description, backHref }: UserAccountDetailProps) => {
    const navigate = useNavigate()
    const [account, setAccount] = useState<UserAccount | null>(null)
    const [bookings, setBookings] = useState<BookingHistoryItem[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [historyLoading, setHistoryLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const totalPages = useMemo(() => {
        if (!totalItems) return 0
        return Math.ceil(totalItems / PAGE_SIZE)
    }, [totalItems])

    const lastPurchase = bookings.length > 0 ? bookings[0].dateTimeBooking : undefined

    const fetchDetail = useCallback(
        async (page: number, initialLoad: boolean = false) => {
            if (!accountId) {
                setError('Account ID is missing from the route.')
                setLoading(false)
                return
            }

            setError(null)
            if (initialLoad) {
                setLoading(true)
            } else {
                setHistoryLoading(true)
            }

            try {
                const response = await getUserAccountDetail(accountId, {
                    limit: PAGE_SIZE,
                    offset: (page - 1) * PAGE_SIZE
                })

                if (response.success && response.data) {
                    setAccount(response.data.account)
                    setBookings(response.data.bookings.items ?? [])
                    setTotalItems(response.data.bookings.meta?.total ?? 0)
                    setCurrentPage(page)
                } else {
                    setError('Unable to load account detail.')
                }
            } catch (err) {
                console.error('Failed to load account detail', err)
                setError('Something went wrong while loading this customer.')
                showToast.error('Unable to load account detail')
            } finally {
                if (initialLoad) {
                    setLoading(false)
                } else {
                    setHistoryLoading(false)
                }
            }
        },
        [accountId]
    )

    useEffect(() => {
        fetchDetail(1, true)
    }, [fetchDetail])

    const handleNavigateBack = () => {
        navigate({ to: backHref })
    }

    const handlePageChange = (page: number) => {
        if (page === currentPage || page < 1 || page > totalPages) return
        fetchDetail(page, false)
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] rounded-3xl border border-surface bg-[#050a1a] p-12 text-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg text-secondary">Loading customer detail...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6 rounded-3xl border border-red-500/40 bg-red-500/5 p-10 text-red-100">
                <p className="text-xl font-semibold">{error}</p>
                <Button onClick={() => fetchDetail(1, true)}>Try again</Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    variant="ghost"
                    className="text-secondary hover:text-white"
                    onClick={handleNavigateBack}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
                </Button>
            </div>

            <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0b1220] via-[#0f182f] to-[#111a33] p-8 text-white shadow-2xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                        {account?.avatarUrl ? (
                            <img
                                src={account.avatarUrl}
                                alt={account.fullName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <User className="h-12 w-12" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                            {title}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold tracking-tight">
                                {account?.fullName || 'Unnamed customer'}
                            </h1>
                            {account && (
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${statusAccent[account.status]}`}
                                >
                                    {account.status}
                                </span>
                            )}
                        </div>
                        <p className="text-secondary max-w-2xl">{description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-primary" />
                                {account?.phoneNumber || 'No phone number'}
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                Member since {formatDateTime(account?.createdAt)}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                {account?.branchName || 'No branch assigned'}
                            </div>
                        </div>
                        {account?.branchAddress && (
                            <p className="text-sm text-gray-400">{account.branchAddress}</p>
                        )}
                        {account?.roleNames && account.roleNames.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {account.roleNames.map((role) => (
                                    <span
                                        key={role}
                                        className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-200"
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                            Total bookings
                        </p>
                        <p className="mt-2 text-3xl font-bold text-white">{totalItems}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                            Loyalty coins
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-3xl font-bold text-amber-300">
                            <Wallet className="h-6 w-6 text-amber-400" />
                            {account?.coin ?? 0}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                            Last purchase
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                            {formatDateTime(lastPurchase)}
                        </p>
                    </div>
                </div>
            </section>

            <Card className="border-0 bg-[#070d1c] text-white">
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-xl">Ticket History</CardTitle>
                            <CardDescription className="text-secondary">
                                A chronological view of every confirmed booking for this customer.
                            </CardDescription>
                        </div>
                        {historyLoading && (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-secondary">
                            This customer has no confirmed bookings yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <article
                                    key={booking.id}
                                    className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 shadow-[0_10px_60px_rgba(0,0,0,0.25)]"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                                {booking.showTime?.movie?.poster ? (
                                                    <img
                                                        src={booking.showTime.movie.poster}
                                                        alt={booking.showTime.movie.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                                                        <Film className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm uppercase tracking-widest text-gray-400">
                                                    {booking.id}
                                                </p>
                                                <h3 className="text-xl font-semibold">
                                                    {booking.showTime?.movie?.name ||
                                                        'Unknown movie'}
                                                </h3>
                                                <p className="text-sm text-gray-400">
                                                    {formatDateTime(booking.showTime?.timeStart)}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest ${
                                                booking.status === BookingStatus.CONFIRMED
                                                    ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40'
                                                    : 'bg-amber-500/15 text-amber-200 border border-amber-500/40'
                                            }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                                Seats
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {booking.seats.map((seat) => (
                                                    <span
                                                        key={seat.id}
                                                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"
                                                    >
                                                        {seat.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                                Room
                                            </p>
                                            <p className="text-base font-semibold">
                                                {booking.showTime?.room?.name || '—'}
                                            </p>
                                            <p className="text-xs text-secondary">
                                                Check-in status:{' '}
                                                {booking.checkInStatus ? 'Checked in' : 'Pending'}
                                            </p>
                                        </div>
                                        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                                Total
                                            </p>
                                            <div className="flex items-center gap-2 text-2xl font-semibold text-primary">
                                                <Ticket className="h-5 w-5" />
                                                {formatCurrency(booking.totalBookingPrice)}
                                            </div>
                                            {booking.qrUrl && (
                                                <a
                                                    href={booking.qrUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-1 inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-100"
                                                >
                                                    <QrCode className="h-3 w-3" />
                                                    View QR ticket
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4 text-sm text-secondary">
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
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
                                                {index > 0 && array[index - 1] !== page - 1 && (
                                                    <span className="px-2 text-secondary">...</span>
                                                )}
                                                <Button
                                                    variant={
                                                        page === currentPage ? 'default' : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default UserAccountDetail
