import ProtectedRoute from '@/features/auth/routes/ProtectedRoute'
import { rootRoute } from '@/shared/routes/__root'
import { createRoute } from '@tanstack/react-router'
import AdminDashboard from '../components/AdminDashboard'

export const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: () => (
        <ProtectedRoute requiredRoles={['admin']}>
            <AdminDashboard />
        </ProtectedRoute>
    )
})
