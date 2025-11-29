import { useBranches } from '@/features/booking/hooks/useBookingApi'
import { useAuth } from '@/features/auth/hooks/auth.hook'
import { MapPin, Bell, User } from 'lucide-react'
import React from 'react'
import { useEmployeeStore } from '../stores/employee.store'

const EmployeeHeader: React.FC = () => {
    const { account: user } = useAuth()
    const { data: branches = [] } = useBranches(true)
    const { selectedBranchId, setSelectedBranchId } = useEmployeeStore()

    return (
        <header className="bg-[var(--brand-surface)] border-b border-gray-700/50 h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
            {/* Left side: Branch Selector */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400 bg-[#1a2232] px-3 py-1.5 rounded-lg border border-gray-700/50 hover:border-[var(--brand-primary)] transition-colors">
                    <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
                    <select
                        value={selectedBranchId || ''}
                        onChange={(e) => setSelectedBranchId(e.target.value || null)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-200 min-w-[150px] cursor-pointer"
                    >
                        <option value="" className="bg-[#1a2232] text-gray-200">
                            Select Branch
                        </option>
                        {branches.map((branch) => (
                            <option
                                key={branch.id}
                                value={branch.id}
                                className="bg-[#1a2232] text-gray-200"
                            >
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Right side: User Profile & Notifications */}
            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--brand-primary)] rounded-full border-2 border-[var(--brand-surface)]"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-700/50">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">
                            {user?.fullName || 'Staff Member'}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                            {user?.roleNames?.[0] || 'Staff'}
                        </p>
                    </div>
                    <div className="w-9 h-9 bg-gradient-to-br from-[var(--brand-primary)] to-[#d35f1a] rounded-full flex items-center justify-center text-white shadow-lg">
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default EmployeeHeader
