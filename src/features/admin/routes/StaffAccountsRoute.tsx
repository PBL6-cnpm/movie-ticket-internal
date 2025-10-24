import { createRoute } from '@tanstack/react-router'
import StaffAccountManageForm from '../pages/StaffAccountManageForm'
import { adminRoute } from './AdminRoute'

export const adminStaffAccountsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/staff-accounts',
    component: StaffAccountManageForm
})
