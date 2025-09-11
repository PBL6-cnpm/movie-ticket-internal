import type { User } from '../../../features/auth/types/auth.type'

interface DashboardLinksProps {
    user: User
}

export default function DashboardLinks({ user }: DashboardLinksProps) {
    return (
        <div className="hidden md:block">
            {user.role?.roleName === 'admin' && (
                <a
                    href="/admin"
                    className="text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Admin Panel
                </a>
            )}
            {user.role?.roleName === 'employee' && (
                <a
                    href="/employee"
                    className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Employee Panel
                </a>
            )}
        </div>
    )
}
