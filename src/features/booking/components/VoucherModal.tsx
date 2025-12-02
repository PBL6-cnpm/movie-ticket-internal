import { DollarSign, Percent, Search, ShoppingCart, Tag, X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useVoucherSearch } from '../hooks/useVouchers'
import type { AppliedVoucher, Voucher } from '../types/voucher.types'

interface VoucherModalProps {
    isOpen: boolean
    onClose: () => void
    vouchers: Voucher[]
    isLoading: boolean
    totalAmount: number
    appliedVoucher: AppliedVoucher | null
    onApplyVoucher: (voucher: Voucher) => void
    onRemoveVoucher: () => void
}

const VoucherModal: React.FC<VoucherModalProps> = ({
    isOpen,
    onClose,
    vouchers,
    isLoading,
    totalAmount,
    appliedVoucher,
    onApplyVoucher,
    onRemoveVoucher
}) => {
    const [searchCode, setSearchCode] = useState('')
    const { searchVoucher, clearSearch, isSearching, searchResult, searchError } =
        useVoucherSearch()

    // Clear search when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchCode('')
            clearSearch()
        }
    }, [isOpen, clearSearch])

    useEffect(() => {
        if (searchCode.trim().length === 0) {
            clearSearch()
        }
    }, [searchCode, clearSearch])

    const handleSearchSubmit = useCallback(() => {
        const normalizedCode = searchCode.trim().toUpperCase()

        if (normalizedCode.length < 3) {
            clearSearch()
            return
        }

        searchVoucher(normalizedCode)
    }, [searchCode, searchVoucher, clearSearch])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            handleSearchSubmit()
        }
    }

    if (!isOpen) return null

    const calculateDiscount = (voucher: Voucher, amount: number): number => {
        // Check minimum order value
        if (voucher.minimumOrderValue && amount < voucher.minimumOrderValue) {
            return 0
        }

        if (voucher.maxDiscountValue) {
            return voucher.maxDiscountValue
        }

        if (voucher.discountValue) {
            return voucher.discountValue
        }

        if (voucher.discountPercent) {
            return (amount * voucher.discountPercent) / 100
        }

        return 0
    }

    const isVoucherApplicable = (voucher: Voucher): boolean => {
        return !voucher.minimumOrderValue || totalAmount >= voucher.minimumOrderValue
    }

    const formatCurrency = (amount: number): string => {
        return amount.toLocaleString('vi-VN')
    }

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    return (
        <div
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex  justify-center p-4 animate-fade-in overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-3xl bg-gradient-to-br from-[#242b3d] to-[#1a2232] rounded-3xl shadow-2xl animate-scale-in border border-white/20 my-8 flex flex-col overflow-hidden"
                onClick={handleContentClick}
                style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#fe7e32] to-[#648ddb] p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Tag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Voucher Collection
                                </h2>
                                <p className="text-white/90 text-sm">
                                    Save more with our exclusive deals
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
                            aria-label="Close voucher modal"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Current Order Summary */}
                    <div className="relative bg-gradient-to-br from-[#1a2232] to-[#242b3d] rounded-xl p-5 border border-white/20 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#fe7e32]/5 to-[#648ddb]/5"></div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-[#fe7e32]/20 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 text-[#fe7e32]" />
                                </div>
                                <span className="font-semibold text-white">Order Summary</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#cccccc]">Subtotal:</span>
                                <span className="text-xl font-bold text-white">
                                    {formatCurrency(totalAmount)} đ
                                </span>
                            </div>
                            {appliedVoucher && (
                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                    <span className="text-sm text-green-400 flex items-center gap-2">
                                        <Tag className="w-3 h-3" />
                                        Applied Voucher:
                                    </span>
                                    <span className="text-sm font-semibold text-green-400">
                                        -{formatCurrency(appliedVoucher.appliedDiscount)} đ
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Voucher Search Section */}
                    <div className="relative bg-gradient-to-br from-[#1a2232] to-[#242b3d] rounded-xl p-5 border border-white/20 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#648ddb]/5 to-[#fe7e32]/5"></div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-[#648ddb]/20 rounded-lg flex items-center justify-center">
                                    <Search className="w-4 h-4 text-[#648ddb]" />
                                </div>
                                <div>
                                    <span className="font-semibold text-white">
                                        Find Hidden Vouchers
                                    </span>
                                    <p className="text-xs text-[#cccccc]">
                                        Enter secret codes for exclusive deals
                                    </p>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter voucher code (e.g. SECRETGIFT)"
                                    className="w-full bg-[#242b3d]/50 border border-white/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#648ddb] focus:border-transparent transition-all backdrop-blur-sm"
                                    maxLength={20}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {isSearching ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#648ddb]"></div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSearchSubmit}
                                            className="text-[#648ddb] hover:text-white transition-colors"
                                            aria-label="Search voucher code"
                                        >
                                            <Search className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Search Result */}
                            {searchResult && (
                                <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Tag className="w-4 h-4 text-blue-400" />
                                                <h4 className="font-semibold text-white">
                                                    {searchResult.name}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-[#cccccc] mb-2">
                                                Code: {searchResult.code}
                                            </p>
                                            <div className="space-y-1 text-xs text-[#cccccc]">
                                                {searchResult.discountPercent && (
                                                    <div className="flex items-center gap-1">
                                                        <span>
                                                            Discount: {searchResult.discountPercent}
                                                            %
                                                        </span>
                                                        {searchResult.maxDiscountValue && (
                                                            <span>
                                                                (Max:{' '}
                                                                {formatCurrency(
                                                                    searchResult.maxDiscountValue
                                                                )}{' '}
                                                                đ)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {searchResult.discountValue && (
                                                    <div>
                                                        Discount:{' '}
                                                        {formatCurrency(searchResult.discountValue)}{' '}
                                                        đ
                                                    </div>
                                                )}
                                                {searchResult.minimumOrderValue && (
                                                    <div>
                                                        Minimum order:{' '}
                                                        {formatCurrency(
                                                            searchResult.minimumOrderValue
                                                        )}{' '}
                                                        đ
                                                    </div>
                                                )}
                                            </div>

                                            {isVoucherApplicable(searchResult) &&
                                                calculateDiscount(searchResult, totalAmount) >
                                                    0 && (
                                                    <div className="mt-2 text-sm font-medium text-blue-400">
                                                        You'll save:{' '}
                                                        {formatCurrency(
                                                            calculateDiscount(
                                                                searchResult,
                                                                totalAmount
                                                            )
                                                        )}{' '}
                                                        đ
                                                    </div>
                                                )}

                                            {!isVoucherApplicable(searchResult) &&
                                                searchResult.minimumOrderValue && (
                                                    <div className="mt-2 text-xs text-red-400">
                                                        Minimum order required:{' '}
                                                        {formatCurrency(
                                                            searchResult.minimumOrderValue
                                                        )}{' '}
                                                        đ
                                                    </div>
                                                )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            {appliedVoucher?.voucher.id === searchResult.id ? (
                                                <span className="text-xs font-medium text-green-400 bg-green-900/20 px-2 py-1 rounded">
                                                    Applied
                                                </span>
                                            ) : isVoucherApplicable(searchResult) ? (
                                                <button
                                                    onClick={() => onApplyVoucher(searchResult)}
                                                    className="text-xs font-medium text-blue-400 hover:text-white bg-blue-500/20 hover:bg-blue-500 px-3 py-1 rounded transition-colors"
                                                >
                                                    Apply
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-500 bg-gray-700/20 px-2 py-1 rounded">
                                                    Not Available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Search Error */}
                            {searchError && (
                                <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <p className="text-sm text-red-400">{searchError}</p>
                                </div>
                            )}

                            {/* Search Hint */}
                            {searchCode && !isSearching && !searchResult && !searchError && (
                                <div className="mt-3 text-xs text-gray-400">
                                    Type at least 3 characters and press Enter to search.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Applied Voucher */}
                    {appliedVoucher && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-green-400 mb-2">
                                Currently Applied
                            </h3>
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag className="w-4 h-4 text-green-400" />
                                            <h4 className="font-semibold text-white">
                                                {appliedVoucher.voucher.name}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-[#cccccc] mb-2">
                                            Code: {appliedVoucher.voucher.code}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-green-400">
                                            <span>
                                                Discount: -
                                                {formatCurrency(appliedVoucher.appliedDiscount)} đ
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onRemoveVoucher}
                                        className="text-red-400 hover:text-red-300 text-xs font-medium px-3 py-1 bg-red-900/20 hover:bg-red-900/30 rounded-md transition-colors"
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vouchers List */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">
                            Available Vouchers ({vouchers.length})
                        </h3>

                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe7e32] mx-auto mb-4"></div>
                                <p className="text-[#cccccc]">Loading vouchers...</p>
                            </div>
                        ) : vouchers.length === 0 ? (
                            <div className="text-center py-8">
                                <Tag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-[#cccccc]">
                                    No vouchers available at the moment
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vouchers.map((voucher) => {
                                    const discount = calculateDiscount(voucher, totalAmount)
                                    const isApplicable = isVoucherApplicable(voucher)
                                    const isCurrentlyApplied =
                                        appliedVoucher?.voucher.id === voucher.id

                                    return (
                                        <div
                                            key={voucher.id}
                                            className={`p-4 rounded-lg border transition-all ${
                                                isCurrentlyApplied
                                                    ? 'bg-green-900/20 border-green-500/50'
                                                    : isApplicable
                                                      ? 'bg-[#1a2232] border-white/20 hover:border-[#fe7e32]/50 cursor-pointer'
                                                      : 'bg-gray-800/50 border-gray-600/30 opacity-60'
                                            }`}
                                            onClick={
                                                isApplicable && !isCurrentlyApplied
                                                    ? () => onApplyVoucher(voucher)
                                                    : undefined
                                            }
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {voucher.discountPercent ? (
                                                            <Percent className="w-4 h-4 text-[#fe7e32]" />
                                                        ) : (
                                                            <DollarSign className="w-4 h-4 text-[#fe7e32]" />
                                                        )}
                                                        <h4 className="font-semibold text-white">
                                                            {voucher.name}
                                                        </h4>
                                                    </div>

                                                    <p className="text-xs text-[#cccccc] mb-2">
                                                        Code:{' '}
                                                        <span className="font-mono bg-[#242b3d] px-2 py-1 rounded">
                                                            {voucher.code}
                                                        </span>
                                                    </p>

                                                    <div className="space-y-1 text-xs text-[#cccccc]">
                                                        {voucher.discountPercent && (
                                                            <div className="flex items-center gap-1">
                                                                <span>
                                                                    Discount:{' '}
                                                                    {voucher.discountPercent}%
                                                                </span>
                                                                {voucher.maxDiscountValue && (
                                                                    <span>
                                                                        (Max:{' '}
                                                                        {formatCurrency(
                                                                            voucher.maxDiscountValue
                                                                        )}{' '}
                                                                        đ)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {voucher.discountValue && (
                                                            <div>
                                                                Discount:{' '}
                                                                {formatCurrency(
                                                                    voucher.discountValue
                                                                )}{' '}
                                                                đ
                                                            </div>
                                                        )}
                                                        {voucher.minimumOrderValue && (
                                                            <div>
                                                                Minimum order:{' '}
                                                                {formatCurrency(
                                                                    voucher.minimumOrderValue
                                                                )}{' '}
                                                                đ
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isApplicable && discount > 0 && (
                                                        <div className="mt-2 text-sm font-medium text-[#fe7e32]">
                                                            You'll save: {formatCurrency(discount)}{' '}
                                                            đ
                                                        </div>
                                                    )}

                                                    {!isApplicable && voucher.minimumOrderValue && (
                                                        <div className="mt-2 text-xs text-red-400">
                                                            Minimum order required:{' '}
                                                            {formatCurrency(
                                                                voucher.minimumOrderValue
                                                            )}{' '}
                                                            đ
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    {isCurrentlyApplied ? (
                                                        <span className="text-xs font-medium text-green-400 bg-green-900/20 px-2 py-1 rounded">
                                                            Applied
                                                        </span>
                                                    ) : isApplicable ? (
                                                        <button className="text-xs font-medium text-[#fe7e32] hover:text-white bg-[#fe7e32]/20 hover:bg-[#fe7e32] px-3 py-1 rounded transition-colors">
                                                            Apply
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 bg-gray-700/20 px-2 py-1 rounded">
                                                            Not Available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="w-full bg-[#fe7e32] hover:bg-[#e56e29] text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Continue Booking
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VoucherModal
