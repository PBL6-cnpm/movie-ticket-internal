import { createRoute } from '@tanstack/react-router'
import SeatsPage from '../../admin/pages/SeatManageForm'
import { superAdminRoute } from './SuperAdmin'

export const superAdminSeatsRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: '/rooms/$roomId/seats',
    component: SeatsPage
})
