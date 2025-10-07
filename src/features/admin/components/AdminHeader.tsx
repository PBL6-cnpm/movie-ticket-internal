import { cn } from '@/lib/utils'
import Button from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Link, useLocation } from '@tanstack/react-router'
import React from 'react'

interface AdminNavItem {
    label: string
    href: string
    icon?: React.ReactNode
}

const AdminHeader: React.FC = () => {
    const location = useLocation()

    const navItems: AdminNavItem[] = [
        {
            label: 'Dashboard',
            href: '/admin'
        },
        {
            label: 'Quản lý Role',
            href: '/admin/roles'
        },
        {
            label: 'Quản lý User',
            href: '/admin/users'
        },
        {
            label: 'Quản lý Phim',
            href: '/admin/movies'
        },
        {
            label: 'Quản lý chi Branch',
            href: '/admin/branches'
        },
        {
            label: 'Báo cáo',
            href: '/admin/reports'
        }
    ]

    return (
        <Card className="mb-6 bg-surface border-surface shadow-lg shadow-black/10">
            <CardContent className="py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                        <h1 className="text-2xl font-bold text-brand-primary">Admin Panel</h1>
                        <div className="w-2 h-2 bg-brand-primary rounded-full ml-2"></div>
                    </div>

                    <nav className="flex items-center space-x-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className="text-decoration-none"
                                >
                                    <Button
                                        variant={isActive ? 'default' : 'ghost'}
                                        size="sm"
                                        className={cn(
                                            'text-sm font-medium transition-all duration-200 hover:scale-105',
                                            isActive
                                                ? 'bg-primary text-white shadow-lg shadow-[#fe7e32]/30'
                                                : 'text-secondary hover:text-primary hover:bg-brand'
                                        )}
                                    >
                                        {item.icon && <span className="mr-2">{item.icon}</span>}
                                        {item.label}
                                    </Button>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </CardContent>
        </Card>
    )
}

export default AdminHeader
