import { createRoute } from '@tanstack/react-router'

import { rootRoute } from '@/shared/routes/__root'
import ForgotPasswordForm from '../pages/ForgotPasswordForm'

export const forgotPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/forgot-password',
    component: ForgotPasswordForm
})
