import type { Account } from '@/features/auth/types/account.type'
import AuthButtons from './AuthButtons'
import DashboardLinks from './DashboardLinks'
import Logo from './Logo'
import Navigation from './Navigation'
import NotificationBell from './NotificationBell'
import SearchBar from './SearchBar'
import UserInfo from './UserInfo'

interface DesktopHeaderProps {
    account: Account | null
    isAuthenticated: boolean
    onMobileMenuToggle: () => void
    isMobileMenuOpen: boolean
}

export default function DesktopHeader({
    account,
    isAuthenticated,
    onMobileMenuToggle,
    isMobileMenuOpen
}: DesktopHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <Logo />
            <Navigation isAuthenticated={isAuthenticated} />

            <div className="flex items-center space-x-2">
                {/* Collapsible Search Bar */}
                <div className="hidden md:block">
                    <SearchBar
                        onSearch={(query) => console.log('Search query:', query)}
                        placeholder="Search movies, theaters..."
                    />
                </div>
                {isAuthenticated && account ? (
                    <>
                        <NotificationBell
                            hasUnreadNotifications={true}
                            notificationCount={3}
                            onClick={() => console.log('Notifications clicked')}
                        />
                        <UserInfo account={account} />
                        <DashboardLinks account={account} />
                    </>
                ) : (
                    <AuthButtons />
                )}

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
