export interface StaffAccount {
    id: string
    email: string
    fullName: string
    phoneNumber: string
    status: string
    createdAt: string
    updatedAt: string
}

export interface CreateStaffAccountRequest {
    email: string
    password: string
    fullName: string
    phoneNumber: string
}

export interface UpdateStaffAccountRequest {
    email?: string
    password?: string
    fullName?: string
    phoneNumber?: string
    status?: string
}

export interface StaffAccountMeta {
    limit: number
    offset: number
    total: number
    totalPages: number
}

export interface StaffAccountListResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: {
        items: StaffAccount[]
        meta: StaffAccountMeta
    }
}
