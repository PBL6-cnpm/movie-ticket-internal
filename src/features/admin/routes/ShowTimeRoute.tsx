import { createRoute } from '@tanstack/react-router'
import ShowTimePage from '../pages/ShowTimePage.tsx'
import { adminRoute } from './AdminRoute'

export const adminShowTimesRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/show-times',
    component: ShowTimePage
})
