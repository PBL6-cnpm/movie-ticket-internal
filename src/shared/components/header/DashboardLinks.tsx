import type { Account } from '@/features/auth/types/account.type'
import { checkRole, Roles } from '@/features/auth/utils/role.util'

interface DashboardLinksProps {
    account: Account
}

export default function DashboardLinks({ account }: DashboardLinksProps) {
    return (
        <div className="hidden md:flex space-x-2">
            {checkRole(account, Roles.SUPER_ADMIN) && (
                <a
                    href="/super-admin"
                    className="text-sm text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Super Admin
                </a>
            )}
            {checkRole(account, Roles.ADMIN) && (
                <a
                    href="/admin/dashboard"
                    className="text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Admin Dashboard
                </a>
            )}
            {checkRole(account, Roles.STAFF) && (
                <a
                    href="/staff"
                    className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Staff Panel
                </a>
            )}
        </div>
    )
}
