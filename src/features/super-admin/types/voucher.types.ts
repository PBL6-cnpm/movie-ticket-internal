export interface Voucher {
    id: string
    name: string
    code: string
    number: number
    discountPercent: number | null
    maxDiscountValue: number | null
    discountValue: number | null
    minimumOrderValue: number | null
    validFrom: string | null
    validTo: string | null
    isPrivate: boolean
    createdAt: string
    updatedAt: string
    usedCount: number
}

export interface CreateVoucherRequest {
    name: string
    code: string
    number: number
    discountPercent?: number | null
    maxDiscountValue?: number | null
    discountValue?: number | null
    minimumOrderValue?: number | null
    validFrom?: string | null
    validTo?: string | null
    isPrivate: boolean
}

export interface UpdateVoucherRequest {
    name?: string
    code?: string
    number?: number
    discountPercent?: number | null
    maxDiscountValue?: number | null
    discountValue?: number | null
    minimumOrderValue?: number | null
    validFrom?: string | null
    validTo?: string | null
    isPrivate?: boolean
}

export interface VoucherMeta {
    limit: number
    offset: number
    total: number
    totalPages: number
}

export interface VoucherListResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: {
        items: Voucher[]
        meta: VoucherMeta
    }
}
