import { createRoute } from '@tanstack/react-router'
import RoleManageForm from '../pages/RoleManageForm'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_ROLE = 'roles'

export const roleManageRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_ROLE}`,
    component: RoleManageForm
})
