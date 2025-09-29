import { createRoute } from '@tanstack/react-router'
import RoleManageForm from '../pages/RoleManageForm'
import { adminRoute } from './Admin'

export const adminRolesRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/roles',
    component: RoleManageForm
})
