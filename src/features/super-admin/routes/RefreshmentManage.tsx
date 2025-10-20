import { createRoute } from '@tanstack/react-router'
import RefreshmentManageForm from '../pages/RefreshmentManageForm'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_REFRESHMENTS = 'refreshments'

export const refreshmentManageRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_REFRESHMENTS}`,
    component: RefreshmentManageForm
})
