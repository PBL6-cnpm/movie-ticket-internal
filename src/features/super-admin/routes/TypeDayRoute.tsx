import TypeDayManageForm from '@/features/super-admin/pages/TypeDayManageForm'
import { createRoute } from '@tanstack/react-router'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_TYPE_DAY = 'type-day'

export const superAdminTypeDayRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_TYPE_DAY}`,
    component: TypeDayManageForm
})
