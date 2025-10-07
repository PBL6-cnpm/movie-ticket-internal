interface NotificationBellProps {
    hasUnreadNotifications?: boolean
    notificationCount?: number
    onClick?: () => void
}

export default function NotificationBell({
    hasUnreadNotifications = false,
    notificationCount = 0,
    onClick
}: NotificationBellProps) {
    return (
        <button
            onClick={onClick}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Notifications"
        >
            <svg
                className="w-6 h-6 text-gray-600 hover:text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
            </svg>

            {/* Notification badge */}
            {(hasUnreadNotifications || notificationCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {notificationCount > 99
                        ? '99+'
                        : notificationCount > 0
                          ? notificationCount
                          : ''}
                </span>
            )}
        </button>
    )
}
