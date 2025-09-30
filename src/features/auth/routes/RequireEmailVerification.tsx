import { rootRoute } from '@/shared/routes/__root'
import { createRoute } from '@tanstack/react-router'
import EmailVerificationSuccess from '../pages/RequireEmailVerification'

export const emailVerificationSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/email-verification',
    component: EmailVerificationSuccess,
    validateSearch: (search: Record<string, unknown>) => ({
        email: (search.email as string) || undefined
    })
})
