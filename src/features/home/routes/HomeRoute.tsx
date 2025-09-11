import { createRoute } from '@tanstack/react-router'

//shared
import { rootRoute } from '@/shared/routes/__root'

//features
import HomePage from '@/features/home/pages/HomePage'

export const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
        <div>
            <HomePage />
        </div>
    )
})
