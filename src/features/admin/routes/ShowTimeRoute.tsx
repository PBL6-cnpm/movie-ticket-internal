import { createRoute } from '@tanstack/react-router'
import ShowTimeDetailPage from '../pages/ShowTimeDetailForm.tsx'
import ShowTimePage from '../pages/ShowTimeManageForm.tsx'
import { adminRoute } from './AdminRoute'

export const adminShowTimesRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/show-times',
    component: ShowTimePage
})

export const adminShowTimeDetailRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/show-times/$movieId',
    component: ShowTimeDetailPage
})
