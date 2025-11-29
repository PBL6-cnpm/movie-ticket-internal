// Voucher type definitions
export interface Voucher {
    id: string
    name: string
    code: string
    discountPercent: number | null
    maxDiscountValue: number | null
    discountValue: number | null
    minimumOrderValue: number | null
}

export interface VoucherApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: Voucher[]
}

export interface AppliedVoucher {
    voucher: Voucher
    appliedDiscount: number
}
