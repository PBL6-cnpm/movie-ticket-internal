import { createRoute } from '@tanstack/react-router'
import ShowTimeDetailPage from '../../admin/pages/ShowTimeDetailForm'
import ShowTimePage from '../../admin/pages/ShowTimeManageForm'
import ShowTimeRoomDetailPage from '../../admin/pages/ShowTimeRoomDetailForm'
import { superAdminRoute } from './SuperAdmin'

export const superAdminShowTimesRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: '/show-times',
    component: ShowTimePage
})

export const superAdminShowTimeDetailRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: '/show-times/$movieId',
    component: ShowTimeDetailPage
})

export const superAdminShowTimeRoomDetailRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: '/show-times/room/$roomId',
    component: ShowTimeRoomDetailPage
})
