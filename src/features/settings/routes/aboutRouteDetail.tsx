import { createRoute } from '@tanstack/react-router'

//features
import { aboutIndexRoute } from '@/features/settings/routes'
import AboutDetailPage from '@/features/settings/pages/AboutDetail/AboutDetailPage'

export const aboutDetailRoute = createRoute({
    getParentRoute: () => aboutIndexRoute,
    path: '$aboutId',
    component: AboutDetailPage
})
