import { createRoute } from '@tanstack/react-router'
import BookingsPage from '../../employee/dashboard/pages/BookingsPage'
import { superAdminRoute } from './SuperAdmin'

export const superAdminBookingsRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: '/bookings',
    component: BookingsPage
})
