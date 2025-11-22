import ProtectedRoute from '@/features/auth/routes/ProtectedRoute'
import { rootRoute } from '@/shared/routes/__root'
import { createRoute } from '@tanstack/react-router'
import AdminDashboard from '../components/AdminDashboard'

export const BASE_SUPER_ADMIN = 'super-admin'

export const superAdminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: `/${BASE_SUPER_ADMIN}`,
    component: () => (
        <ProtectedRoute requiredRoles={['super_admin']}>
            <AdminDashboard />
        </ProtectedRoute>
    )
})
