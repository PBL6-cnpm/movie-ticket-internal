import { createRoute } from '@tanstack/react-router'
import StaffAccountManageForm from '../../admin/pages/StaffAccountManageForm'
import { superAdminRoute } from './SuperAdmin'

export const superAdminStaffAccountsRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: '/staff-accounts',
    component: StaffAccountManageForm
})
