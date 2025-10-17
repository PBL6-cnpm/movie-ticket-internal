import { cn } from '@/lib/utils'
import { Link, useLocation } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import {
    BASE_SUPER_ADMIN,
    SUPER_ADMIN_ADMIN_ACCOUNTS,
    SUPER_ADMIN_BRANCH,
    SUPER_ADMIN_ROLE,
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
