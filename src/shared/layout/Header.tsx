'use client'

import { useState } from 'react'
import { useAuth } from '../../features/auth/hooks/auth.hook'
import { DesktopHeader, MobileHeader } from '../components/header'

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { account, isAuthenticated } = useAuth()

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    return (
        <header className="bg-surface shadow-lg sticky top-0 z-50 border-b border-surface py-3">
            <div className="container-custom">
                <DesktopHeader
                    account={account}
                    isAuthenticated={isAuthenticated}
                    onMobileMenuToggle={handleMobileMenuToggle}
                    isMobileMenuOpen={mobileMenuOpen}
                />

                <MobileHeader
                    account={account}
                    isAuthenticated={isAuthenticated}
                    isOpen={mobileMenuOpen}
                />
            </div>
        </header>
    )
}
