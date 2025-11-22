import { useAuth } from '@/features/auth/hooks/auth.hook'
import { cn } from '@/lib/utils'
import { Link, useLocation } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import {
    ADMIN_REVENUE_STATISTICS,
    ADMIN_ROOMS,
    ADMIN_SHOW_TIMES,
    ADMIN_STAFF_ACCOUNTS,
    BASE_ADMIN
} from '../routes'

interface AdminNavItem {
    label: string
    href: string
    icon?: React.ReactNode
}

// Add custom keyframes animation
const addCustomAnimations = () => {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = `
        @keyframes slideInFromLeft {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `
    if (!document.head.querySelector('#admin-sidebar-animations')) {
        styleSheet.id = 'admin-sidebar-animations'
        document.head.appendChild(styleSheet)
    }
}

const AdminSidebar: React.FC = () => {
    const location = useLocation()
    const { logout } = useAuth()

    useEffect(() => {
        addCustomAnimations()
    }, [])

    const navItems: AdminNavItem[] = [
        {
            label: 'Revenue Statistics',
            href: `/${BASE_ADMIN}/${ADMIN_REVENUE_STATISTICS}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            )
        },
        {
            label: 'Rooms Management',
            href: `/${BASE_ADMIN}/${ADMIN_ROOMS}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
            )
        },
        {
            label: 'Showtime Management',
            href: `/${BASE_ADMIN}/${ADMIN_SHOW_TIMES}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            )
        },
        {
            label: 'Staff Accounts',
            href: `/${BASE_ADMIN}/${ADMIN_STAFF_ACCOUNTS}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            )
        }
    ]

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40 animate-in slide-in-from-left duration-300">
            {/* Logo/Brand */}
            <div className="p-6 border-border animate-in fade-in duration-500">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#e86d28] to-[#d35f1a] rounded-lg flex items-center justify-center shadow-lg shadow-[#e86d28]/30 animate-in zoom-in duration-300">
                        <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[#e86d28]">Admin Panel</h1>
                        <p className="text-xs text-muted-foreground">System Management</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item, index) => {
                    const isActive = location.pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className="text-decoration-none block"
                            style={{
                                animation: `slideInFromLeft 0.3s ease-out ${index * 0.1}s both`
                            }}
                        >
                            <div
                                className={cn(
                                    'group relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out',
                                    isActive
                                        ? 'bg-[#e86d28] text-white shadow-lg shadow-[#e86d28]/40 scale-105 translate-x-1'
                                        : 'text-foreground hover:bg-[#e86d28]/10 hover:text-[#e86d28] hover:translate-x-1 hover:shadow-md'
                                )}
                            >
                                {item.icon && (
                                    <span
                                        className={cn(
                                            'shrink-0 transition-transform duration-300',
                                            isActive
                                                ? 'text-white scale-110'
                                                : 'text-muted-foreground group-hover:text-[#fe7e32] group-hover:scale-110'
                                        )}
                                    >
                                        {item.icon}
                                    </span>
                                )}
                                <span
                                    className={cn(
                                        'font-medium text-sm transition-all duration-300',
                                        isActive ? 'font-bold' : 'group-hover:font-semibold'
                                    )}
                                >
                                    {item.label}
                                </span>

                                {/* Chevron indicator */}
                                <svg
                                    className={cn(
                                        'w-4 h-4 ml-auto transition-all duration-300',
                                        isActive
                                            ? 'opacity-100 translate-x-0'
                                            : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                                    )}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-border animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>System Online</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </aside>
    )
}

export default AdminSidebar
