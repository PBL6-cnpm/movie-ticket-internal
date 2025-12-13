import { createRoute } from '@tanstack/react-router'
import VoucherManageForm from '../pages/VoucherManageForm'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_VOUCHERS = 'vouchers'

export const voucherManageRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_VOUCHERS}`,
    component: VoucherManageForm
})
