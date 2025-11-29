import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EmployeeState {
    selectedBranchId: string | null
    setSelectedBranchId: (id: string | null) => void
}

export const useEmployeeStore = create<EmployeeState>()(
    persist(
        (set) => ({
            selectedBranchId: null,
            setSelectedBranchId: (id) => set({ selectedBranchId: id })
        }),
        {
            name: 'employee-storage'
        }
    )
)
