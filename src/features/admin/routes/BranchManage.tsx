import { createRoute } from '@tanstack/react-router'
import BranchManageForm from '../pages/BranchManageForm'
import { adminRoute } from './Admin'

export const adminBranchesRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/branches',
    component: BranchManageForm
})
