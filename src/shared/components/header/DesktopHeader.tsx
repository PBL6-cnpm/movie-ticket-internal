import type { User } from '../../../features/auth/types/auth.type'
import AuthButtons from './AuthButtons'
import DashboardLinks from './DashboardLinks'
import Logo from './Logo'
import Navigation from './Navigation'
import UserInfo from './UserInfo'

interface DesktopHeaderProps {
    user: User | null
    isAuthenticated: boolean
    onMobileMenuToggle: () => void
    isMobileMenuOpen: boolean
}

export default function DesktopHeader({
    user,
    isAuthenticated,
    onMobileMenuToggle,
    isMobileMenuOpen
}: DesktopHeaderProps) {
    return (
        <div className="flex items-center justify-between h-16">
            <Logo />
            <Navigation isAuthenticated={isAuthenticated} />

            {/* User Section */}
            <div className="flex items-center gap-4">
                {isAuthenticated && user ? (
                    <>
                        <UserInfo user={user} />
                        <DashboardLinks user={user} />
                    </>
                ) : (
                    <AuthButtons />
                )}

                {/* Mobile Menu Button */}
                <button
                    onClick={onMobileMenuToggle}
                    className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>
        </div>
    )
}
