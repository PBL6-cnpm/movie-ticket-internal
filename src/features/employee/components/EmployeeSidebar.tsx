import { useAuth } from '@/features/auth/hooks/auth.hook'
import { cn } from '@/lib/utils'
import { Link, useLocation } from '@tanstack/react-router'
import React, { useEffect } from 'react'

interface EmployeeNavItem {
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
    if (!document.head.querySelector('#employee-sidebar-animations')) {
        styleSheet.id = 'employee-sidebar-animations'
        document.head.appendChild(styleSheet)
    }
}

const EmployeeSidebar: React.FC = () => {
    const location = useLocation()
    const { logout } = useAuth()

    useEffect(() => {
        addCustomAnimations()
    }, [])

    const navItems: EmployeeNavItem[] = [
        {
            label: 'Dashboard',
            href: '/staff',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5v2m8-2v2"
                    />
                </svg>
            )
        },
        {
            label: 'New Booking',
            href: '/staff/booking/new',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                </svg>
            )
        },
        {
            label: 'Manage Bookings',
            href: '/staff/bookings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                </svg>
            )
        },
        {
            label: 'Movie Schedule',
            href: '/staff/schedule',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"
                    />
                </svg>
            )
        },
        {
            label: 'Customer Support',
            href: '/staff/support',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            )
        },
        {
            label: 'Daily Reports',
            href: '/staff/reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
                        <span className="text-white font-bold text-lg">ST</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[#e86d28]">Staff Panel</h1>
                        <p className="text-xs text-muted-foreground">Staff Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item, index) => {
                    const isActive = location.pathname === item.href

                    return (
                        <Link key={item.href} to={item.href}>
                            <div
                                className={cn(
                                    'group relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out',
                                    isActive
                                        ? 'bg-[#e86d28] text-white shadow-lg shadow-[#e86d28]/40 scale-105 translate-x-1'
                                        : 'text-foreground hover:bg-[#e86d28]/10 hover:text-[#e86d28] hover:translate-x-1 hover:shadow-md'
                                )}
                                style={{
                                    animation: `slideInFromLeft 0.3s ease-out ${index * 0.1}s both`
                                }}
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
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-4">
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

export default EmployeeSidebar
