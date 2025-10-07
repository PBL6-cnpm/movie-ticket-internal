import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../../../shared/routes/__root'
import RequireEmailVerification from '../pages/RequireEmailVerification'

export const emailVerificationRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/email-verification',
    validateSearch: (search: Record<string, unknown>) => ({
        email: (search.email as string) || ''
    }),
    component: RequireEmailVerification
})
