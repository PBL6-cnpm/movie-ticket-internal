import { createRoute } from '@tanstack/react-router'
import AdminAccountManageForm from '../pages/AdminAccountManageForm'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_ADMIN_ACCOUNTS = 'admin-accounts'

export const adminAccountManageRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_ADMIN_ACCOUNTS}`,
    component: AdminAccountManageForm
})
