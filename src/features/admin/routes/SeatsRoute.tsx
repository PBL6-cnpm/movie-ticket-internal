import { createRoute } from '@tanstack/react-router'
import SeatsPage from '../pages/SeatManageForm'
import { adminRoute } from './AdminRoute'

export const adminSeatsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/rooms/$roomId/seats',
    component: SeatsPage
})
