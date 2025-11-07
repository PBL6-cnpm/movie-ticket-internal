import { createRoute } from '@tanstack/react-router'
import RoomsPage from '../../admin/pages/RoomManageForm'
import { superAdminRoute } from './SuperAdmin'

export const superAdminRoomsRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: '/rooms',
    component: RoomsPage
})
