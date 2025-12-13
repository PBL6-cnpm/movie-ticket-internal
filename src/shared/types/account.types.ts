import type { ApiResponse } from './api-response.types'
import type { BookingHistoryItem } from './booking.types'
import type { IPaginatedResponse } from './paginated-response.types'

export enum AccountStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    DELETED = 'deleted'
}

export interface UserAccount {
    id: string
    email: string
    fullName: string
    phoneNumber?: string
    status: AccountStatus
    branchId?: string
    branchName?: string
    branchAddress?: string
    coin?: number
    avatarUrl?: string
    roleNames?: string[]
    createdAt: string
}

export type UserAccountListResponse = ApiResponse<IPaginatedResponse<UserAccount>>

export interface UserAccountDetailPayload {
    account: UserAccount
    bookings: IPaginatedResponse<BookingHistoryItem>
}

export type UserAccountDetailResponse = ApiResponse<UserAccountDetailPayload>
