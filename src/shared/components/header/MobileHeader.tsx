import { useAuth } from '../../../features/auth/hooks/auth.hook'
import type { User } from '../../../features/auth/types/auth.type'

interface MobileHeaderProps {
    user: User | null
    isAuthenticated: boolean
    isOpen: boolean
}

export default function MobileHeader({ user, isAuthenticated, isOpen }: MobileHeaderProps) {
    const { logout } = useAuth()

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }
    if (!isOpen) return null

    return (
        <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
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
                        {user && (
                            <div className="px-3 py-2 border-t border-gray-200 mt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        {user.name}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${
                                            user.role?.roleName === 'admin'
                                                ? 'bg-red-500'
                                                : user.role?.roleName === 'employee'
                                                  ? 'bg-blue-500'
                                                  : 'bg-green-500'
                                        }`}
                                    >
                                        {user.role?.roleName === 'admin'
                                            ? 'Admin'
                                            : user.role?.roleName === 'employee'
                                              ? 'Employee'
                                              : 'Customer'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-gray-500">Balance:</span>
                                    <span className="text-xs font-medium text-yellow-600">
                                        {user.coin} coins
                                    </span>
                                </div>

                                {/* Mobile Dashboard Link */}
                                {user.role?.roleName === 'admin' && (
                                    <a
                                        href="/admin"
                                        className="block w-full text-center text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium mb-2 transition-colors"
                                    >
                                        Admin Panel
                                    </a>
                                )}
                                {user.role?.roleName === 'employee' && (
                                    <a
                                        href="/employee"
                                        className="block w-full text-center text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium mb-2 transition-colors"
                                    >
                                        Employee Panel
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
                            Sign Up
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
