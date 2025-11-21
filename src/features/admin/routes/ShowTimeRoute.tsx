import { createRoute } from '@tanstack/react-router'
import ShowTimeDetailPage from '../pages/ShowTimeDetailForm.tsx'
import ShowTimePage from '../pages/ShowTimeManageForm.tsx'
import ShowTimeRoomDetailPage from '../pages/ShowTimeRoomDetailForm.tsx'
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

export const adminShowTimeRoomDetailRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/show-times/room/$roomId',
    component: ShowTimeRoomDetailPage
})
