import { apiClient } from '@/shared/api/api-client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Voucher, VoucherApiResponse } from '../types/voucher.types'

// Hook để lấy danh sách voucher public
export const usePublicVouchers = () => {
    return useQuery<VoucherApiResponse>({
        queryKey: ['publicVouchers'],
        queryFn: async () => {
            const response = await apiClient.get('/voucher/public')
            if (!response.data) {
                throw new Error('Failed to fetch vouchers')
            }
            return response.data
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}

// Hook để tìm kiếm voucher private bằng code
export const useVoucherSearch = () => {
    const [isSearching, setIsSearching] = useState(false)
    const [searchResult, setSearchResult] = useState<Voucher | null>(null)
    const [searchError, setSearchError] = useState<string | null>(null)

    const searchVoucher = async (code: string): Promise<void> => {
        const trimmedCode = code.trim().toUpperCase()

        if (!trimmedCode) {
            setSearchResult(null)
            setSearchError(null)
            return
        }

        setIsSearching(true)
        setSearchError(null)

        try {
            const response = await apiClient.post('/voucher/check', {
                code: trimmedCode
            })

            const payload = response.data

            if (payload?.success && payload.data) {
                setSearchResult(payload.data)
            } else {
                setSearchResult(null)
                setSearchError('Voucher not found or expired')
            }
        } catch (error) {
            setSearchResult(null)
            setSearchError(error instanceof Error ? error.message : 'Voucher not found or expired')
        } finally {
            setIsSearching(false)
        }
    }

    const clearSearch = () => {
        setSearchResult(null)
        setSearchError(null)
    }

    return {
        searchVoucher,
        clearSearch,
        isSearching,
        searchResult,
        searchError
    }
}
