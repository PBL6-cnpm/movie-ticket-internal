import { rootRoute } from '@/shared/routes/__root'
import { createRoute } from '@tanstack/react-router'
import VerifyEmailSuccess from '../pages/VerifyEmailSuccess'

export const verifyEmailSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/verify-email',
    component: VerifyEmailSuccess,
    validateSearch: (search: Record<string, unknown>) => ({
        email: (search.email as string) || undefined
    })
})
