import { employeeRoute } from '@/features/employee/dashboard/routes/EmployeeRoute'
import { createRoute } from '@tanstack/react-router'
import BookingsPage from '../pages/BookingsPage'
import ReportsPage from '../pages/ReportsPage'
import SchedulePage from '../pages/SchedulePage'
import SupportPage from '../pages/SupportPage'

export const reportsRoute = createRoute({
    getParentRoute: () => employeeRoute,
    path: 'reports',
    component: ReportsPage
})

export const supportRoute = createRoute({
    getParentRoute: () => employeeRoute,
    path: 'support',
    component: SupportPage
})

export const scheduleRoute = createRoute({
    getParentRoute: () => employeeRoute,
    path: 'schedule',
    component: SchedulePage
})

export const bookingsRoute = createRoute({
    getParentRoute: () => employeeRoute,
    path: 'bookings',
    component: BookingsPage
})
