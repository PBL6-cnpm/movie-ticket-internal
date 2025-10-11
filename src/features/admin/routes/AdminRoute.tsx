import { rootRoute } from '@/shared/routes/__root'
import { createRoute } from '@tanstack/react-router'
import AdminDashboard from '../components/AdminDashboard'

export const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: AdminDashboard
})
