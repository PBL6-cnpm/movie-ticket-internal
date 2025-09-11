'use client'

import { useAuth } from '@/features/auth/hooks/auth.hook'
import { useEffect } from 'react'

const HomeSection = () => {
    const { isAuthenticated, user } = useAuth()

    useEffect(() => {
        if (isAuthenticated && user) {
            // Auto redirect based on role
            if (user.role?.roleName === 'admin') {
                window.location.href = '/admin'
            } else if (user.role?.roleName === 'employee') {
                window.location.href = '/employee'
            } else if (user.role?.roleName === 'user') {
                window.location.href = '/customer'
            }
        }
    }, [isAuthenticated, user])

    if (isAuthenticated) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4 text-primary">Redirecting...</h1>
                <p className="text-secondary">Taking you to your dashboard...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 text-center space-y-8">
            <div className="card p-6 space-y-4">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Demo Accounts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card p-4">
                        <div className="text-secondary font-bold text-lg mb-2">Employee</div>
                        <p className="text-sm text-secondary mb-2">Booking & customer service</p>
                        <p className="text-xs font-mono bg-surface text-secondary p-2 rounded">
                            employee@example.com
                        </p>
                        <p className="text-xs font-mono bg-surface text-secondary p-2 rounded mt-1">
                            123456
                        </p>
                    </div>

                    <div className="card p-4">
                        <div className="text-primary font-bold text-lg mb-2">Customer</div>
                        <p className="text-sm text-secondary mb-2">Book tickets & browse movies</p>
                        <p className="text-xs font-mono bg-surface text-secondary p-2 rounded">
                            user@example.com
                        </p>
                        <p className="text-xs font-mono bg-surface text-secondary p-2 rounded mt-1">
                            123456
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeSection
