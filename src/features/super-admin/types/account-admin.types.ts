import { AccountStatus } from '@/shared/types/account.types'

export { AccountStatus }

export interface UpdateAccountRequest {
    fullName?: string
    email?: string
    password?: string // undefined means keep current password
    phoneNumber?: string
    branchId: string
    status: AccountStatus
    roleIds: string[]
}

export interface SearchAdminAccountParams {
    name?: string
    email?: string
    phoneNumber?: string
    limit?: number
    offset?: number
}

export interface GetAllAdminAccountsParams {
    limit?: number
    offset?: number
    search?: string
}

export interface AdminAccount {
    id: string
    email: string
    fullName: string
    phoneNumber: string
    branchId: string
    branchName?: string
    roleNames: string[]
    roleIds: string[]
    status: AccountStatus
    createdAt: string
    updatedAt: string
}

export interface AdminAccount {
    id: string
    email: string
    fullName: string
    phoneNumber: string
    branchId: string
    branchName?: string
    roleNames: string[]
    roleIds: string[]
    status: AccountStatus
    createdAt: string
    updatedAt: string
}

export interface UpdateAdminAccountRequest {
    fullName?: string
    email?: string
    password?: string // undefined means keep current password
    phoneNumber?: string
    branchId: string
    status?: AccountStatus
    roleIds?: string[]
}

export interface CreateAdminAccountRequest {
    email: string
    password: string
    fullName: string
    phoneNumber: string
    branchId: string
}

export interface CreateAdminAccountResponse {
    success: boolean
    message: string
    data: AdminAccount
}

export interface SearchAdminAccountParams {
    name?: string
    email?: string
    phoneNumber?: string
    limit?: number
    offset?: number
}

export interface GetAllAdminAccountsParams {
    limit?: number
    offset?: number
    search?: string
}
