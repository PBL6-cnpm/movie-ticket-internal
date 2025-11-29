import { employeeRoute } from '@/features/employee/dashboard/routes/EmployeeRoute'
import { createRoute } from '@tanstack/react-router'
import BookingPage from '@/features/booking/pages/BookingPage'
import StaffBookingEntryPage from '@/features/booking/pages/StaffBookingEntryPage'

export const bookingRoute = createRoute({
    getParentRoute: () => employeeRoute,
    path: 'booking',
    component: BookingPage
})

export const bookingEntryRoute = createRoute({
    getParentRoute: () => employeeRoute,
    path: 'booking/new',
    component: StaffBookingEntryPage
})
