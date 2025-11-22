import type { MovieRevenue } from '@/features/super-admin/types/report.types'

// Admin branch revenue statistics interfaces
export interface BranchRevenueData {
    branchId?: string
    branchName?: string
    branchAddress?: string
    totalRevenue: number
    totalBookings: number
    totalTicketsSold: number
    totalRefreshmentsRevenue: number
    averageTicketPrice: number
    period: {
        startDate: string
        endDate: string
    }
    revenueByPeriod?: Array<{
        period: string
        revenue: number
        ticketsSold: number
        refreshmentsRevenue: number
    }>

    movieStats?: MovieRevenue[]
}

export type GroupByType = 'day' | 'month' | 'quarter' | 'year'

export interface BranchRevenueApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: BranchRevenueData
}
