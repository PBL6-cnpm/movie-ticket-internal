'use client'

import { useState } from 'react'
import { useAuth } from '../../features/auth/hooks/auth.hook'
import { DesktopHeader, MobileHeader } from '../components/header'

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user, isAuthenticated } = useAuth()

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    return (
        <header className="bg-surface shadow-lg sticky top-0 z-50 border-b border-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <DesktopHeader
                    user={user}
                    isAuthenticated={isAuthenticated}
                    onMobileMenuToggle={handleMobileMenuToggle}
                    isMobileMenuOpen={mobileMenuOpen}
                />

                <MobileHeader
                    user={user}
                    isAuthenticated={isAuthenticated}
                    isOpen={mobileMenuOpen}
                />
            </div>
        </header>
    )
}
