import { createRoute } from '@tanstack/react-router'
import BranchManageForm from '../pages/BranchManageForm'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_BRANCH = 'branches'

export const branchManageRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_BRANCH}`,
    component: BranchManageForm
})
