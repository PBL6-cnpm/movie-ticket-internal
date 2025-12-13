import { employeeRoute } from '@/features/employee/dashboard/routes/EmployeeRoute'
import { createRoute } from '@tanstack/react-router'
import BookingsPage from '../pages/BookingsPage'
import ReportsPage from '../pages/ReportsPage'
import SchedulePage from '../pages/SchedulePage'
import StaffUserAccountDetailPage from '../pages/UserAccountDetailPage'
import StaffUserAccountsPage from '../pages/UserAccountsPage'
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

export const staffUserAccountsRoute = createRoute({
    getParentRoute: () => employeeRoute,
    path: 'user-accounts',
    component: StaffUserAccountsPage
})

export const staffUserAccountDetailRoute = createRoute({
    getParentRoute: () => employeeRoute,
    path: 'user-accounts/$accountId',
    component: StaffUserAccountDetailPage
})
