import { createRoute } from '@tanstack/react-router'

//features
import AboutPage from '@/features/settings/pages/About/AboutPage'
import { aboutIndexRoute } from '@/features/settings/routes'

export const aboutRoute = createRoute({
    getParentRoute: () => aboutIndexRoute,
    path: '/',
    component: AboutPage
})
