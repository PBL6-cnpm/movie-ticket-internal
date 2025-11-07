import { createRoute } from '@tanstack/react-router'
import RoomsPage from '../pages/RoomManageForm'
import { adminRoute } from './AdminRoute'

export const adminRoomsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/rooms',
    component: RoomsPage
})
