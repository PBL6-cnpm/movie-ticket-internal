import ProtectedRoute from '@/features/auth/routes/ProtectedRoute'
import { rootRoute } from '@/shared/routes/__root'
import { createRoute } from '@tanstack/react-router'
import EmployeeDashboard from '../components/EmployeeDashboard'

export const employeeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/staff',
    component: () => (
        <ProtectedRoute requiredRoles={['staff']}>
            <EmployeeDashboard />
        </ProtectedRoute>
    )
})
