import SpecialDateManageForm from '@/features/super-admin/pages/SpecialDateManageForm'
import { createRoute } from '@tanstack/react-router'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_SPECIAL_DATE = 'special-date'

export const superAdminSpecialDateRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_SPECIAL_DATE}`,
    component: SpecialDateManageForm
})
