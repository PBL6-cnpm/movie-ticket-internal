'use client'

import { useAuth } from '@/features/auth/hooks/auth.hook'
import type { User } from '@/features/auth/types/auth.type'
import { useEffect, useRef, useState } from 'react'

interface UserInfoProps {
    user: User
}

export default function UserInfo({ user }: UserInfoProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { logout } = useAuth()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Avatar/Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-surface transition-colors"
            >
                {/* User Avatar */}
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                </div>

                {/* Dropdown Arrow */}
                <svg
                    className={`w-4 h-4 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface rounded-lg shadow-lg border border-surface py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-surface">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-primary">{user.name}</p>
                                <p className="text-sm text-secondary">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        {/* My Profile */}
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                // Add navigation to profile page
                                console.log('Navigate to profile')
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-primary hover:bg-surface transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            My Profile
                        </button>

                        {/* My Points */}
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                // Add navigation to points page
                                console.log('Navigate to points')
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-primary hover:bg-surface transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                            </svg>
                            <div className="flex items-center justify-between w-full">
                                <span>My Points</span>
                                <span className="text-xs text-primary font-medium bg-secondary px-2 py-1 rounded-full">
                                    {user.coin} coins
                                </span>
                            </div>
                        </button>

                        {/* Divider */}
                        <div className="my-1 border-t border-surface"></div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
