import { createRoute } from '@tanstack/react-router'
import TypeSeatManageForm from '../pages/TypeSeatManageForm'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_TYPE_SEATS = 'type-seats'

export const typeSeatManageRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_TYPE_SEATS}`,
    component: TypeSeatManageForm
})
