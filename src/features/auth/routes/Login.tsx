import { rootRoute } from '@/shared/routes/__root'
import { createRoute } from '@tanstack/react-router'
import LoginPage from '../pages/LoginForm'

export const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginPage
})
