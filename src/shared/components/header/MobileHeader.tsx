import type { Account } from '@/features/auth/types/account.type'
import { checkRole, Roles } from '@/features/auth/utils/role.util'
import { useAuth } from '../../../../../movie-ticket-web/src/features/auth/hooks/auth.hook'
import SearchBar from './SearchBar'

interface MobileHeaderProps {
    account: Account | null
    isAuthenticated: boolean
    isOpen: boolean
}

export default function MobileHeader({ account, isAuthenticated, isOpen }: MobileHeaderProps) {
    const { logout } = useAuth()

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }
    if (!isOpen) return null

    return (
        <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile Search Bar */}
                <div className="px-3 py-2">
                    <SearchBar
                        onSearch={(query) => console.log('Mobile search query:', query)}
                        placeholder="Search movies, theaters..."
                        className="w-full"
                    />
                </div>

                <a
                    href="/"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                    Home
                </a>
                <a
                    href="#"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                    Movies
                </a>
                <a
                    href="#"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                    Theaters
                </a>
                <a
                    href="#"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                    Showtimes
                </a>

                {isAuthenticated ? (
                    <>
                        <a
                            href="#"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        >
                            My Bookings
                        </a>

                        {/* Mobile User Info */}
                        {account && (
                            <div className="px-3 py-2 border-t border-gray-200 mt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        {account.fullName}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${
                                            checkRole(account, Roles.ADMIN)
                                                ? 'bg-red-500'
                                                : checkRole(account, Roles.STAFF)
                                                  ? 'bg-blue-500'
                                                  : 'bg-green-500'
                                        }`}
                                    >
                                        {checkRole(account, Roles.ADMIN)
                                            ? 'Admin'
                                            : checkRole(account, Roles.STAFF)
                                              ? 'Staff'
                                              : 'Customer'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-gray-500">Balance:</span>
                                    <span className="text-xs font-medium text-yellow-600">
                                        {account.coin} coins
                                    </span>
                                </div>

                                {/* Mobile Dashboard Link */}
                                {checkRole(account, Roles.ADMIN) && (
                                    <a
                                        href="/admin"
                                        className="block w-full text-center text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium mb-2 transition-colors"
                                    >
                                        Admin Panel
                                    </a>
                                )}
                                {checkRole(account, Roles.STAFF) && (
                                    <a
                                        href="/staff"
                                        className="block w-full text-center text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium mb-2 transition-colors"
                                    >
                                        Staff Panel
                                    </a>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-lg font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="px-3 grid grid-cols-1 py-2 border-t border-gray-200 mt-2 gap-2">
                        <a
                            href="/login"
                            className="flex w-full justify-center text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-lg font-medium transition-colors"
                        >
                            Login
                        </a>

                        <a
                            href="/register"
                            className="flex w-full justify-center text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Register
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
