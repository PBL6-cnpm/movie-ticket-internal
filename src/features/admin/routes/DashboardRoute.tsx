import { createRoute } from '@tanstack/react-router'
import DashboardPage from '../pages/DashboardPage'
import { adminRoute } from './AdminRoute'

export const adminDashboardRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/dashboard',
    component: DashboardPage
})
