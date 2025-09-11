import { rootRoute } from '@/shared/routes/__root'
import { createRoute } from '@tanstack/react-router'
import RegisterPage from '../pages/RegisterForm'

export const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: RegisterPage
})
