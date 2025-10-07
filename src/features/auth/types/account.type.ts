import type { Role } from './role.type'

export interface Account {
    id: string
    email: string
    status: boolean
    branchId?: string
    coin: number
    avatarUrl?: string
    fullName: string
    phoneNumber?: string
    roleNames: string[]
    createdAt?: string // Additional field
    updatedAt?: string // Additional field

    roles?: Role[]
}
