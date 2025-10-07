import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../../../shared/routes/__root'
import VerifyEmailSuccess from '../pages/VerifyEmailSuccess'

export const verifyEmailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/verify-email',
    validateSearch: (search: Record<string, unknown>) => ({
        email: (search.email as string) || ''
    }),
    component: VerifyEmailSuccess
})
