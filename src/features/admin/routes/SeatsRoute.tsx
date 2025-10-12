import { createRoute } from '@tanstack/react-router'
import SeatsPage from '../pages/SeatsPage'
import { adminRoute } from './AdminRoute'

export const adminSeatsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/rooms/$roomId/seats',
    component: SeatsPage
})
