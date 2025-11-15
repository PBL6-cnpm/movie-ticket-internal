import { cn } from '@/lib/utils'
import { Link, useLocation } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import {
    BASE_SUPER_ADMIN,
    SUPER_ADMIN_ADMIN_ACCOUNTS,
    SUPER_ADMIN_BRANCH,
    SUPER_ADMIN_MOVIES,
    SUPER_ADMIN_REFRESHMENTS,
    SUPER_ADMIN_REPORTS,
    SUPER_ADMIN_ROLE,
    SUPER_ADMIN_SPECIAL_DATE,
    SUPER_ADMIN_TYPE_DAY,
    SUPER_ADMIN_TYPE_SEATS
} from '../routes'

interface SuperAdminNavItem {
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
    if (!document.head.querySelector('#super-admin-sidebar-animations')) {
        styleSheet.id = 'super-admin-sidebar-animations'
        document.head.appendChild(styleSheet)
    }
}

const SuperAdminSidebar: React.FC = () => {
    const location = useLocation()

    useEffect(() => {
        addCustomAnimations()
    }, [])

    const navItems: SuperAdminNavItem[] = [
        {
            label: 'Role Management',
            href: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_ROLE}`,
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
        },
        {
            label: 'Branch Management',
            href: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_BRANCH}`,
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
            label: 'Admin Accounts',
            href: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_ADMIN_ACCOUNTS}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            )
        },
        {
            label: 'Seat Types',
            href: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_TYPE_SEATS}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h14a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3z"
                    />
                </svg>
            )
        },
        {
            label: 'Day Types',
            href: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_TYPE_DAY}`,

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
            label: 'Special Dates',
            href: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_SPECIAL_DATE}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                </svg>
            )
        },

        {
            label: 'Movies',
            href: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_MOVIES}`,

            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h10M9 9l2 2 4-4"
                    />
                </svg>
            )
        },
        {
            label: 'Refreshments',
            href: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_REFRESHMENTS}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                </svg>
            )
        },
        {
            label: 'Revenue Reports',
            href: `/${BASE_SUPER_ADMIN}/${SUPER_ADMIN_REPORTS}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3v18h18M16 6v6m-4-4v10m-4-6v4"
                    />
                </svg>
            )
        }
    ]

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40 animate-in slide-in-from-left duration-300">
            {/* Logo/Brand */}
            <div className="p-6 border-border animate-in fade-in duration-500">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#e86d28] to-[#d35f1a] rounded-lg flex items-center justify-center shadow-lg shadow-[#e86d28]/30 animate-in zoom-in duration-300">
                        <span className="text-white font-bold text-lg">SA</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[#e86d28]">Super Admin</h1>
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
            </div>
        </aside>
    )
}

export default SuperAdminSidebar
