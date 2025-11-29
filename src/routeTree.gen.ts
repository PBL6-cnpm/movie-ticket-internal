import {
    adminRevenueStatisticsRoute,
    adminRoomsRoute,
    adminRoute,
    adminSeatsRoute,
    adminShowTimeDetailRoute,
    adminShowTimeRoomDetailRoute,
    adminShowTimesRoute,
    adminStaffAccountsRoute
} from './features/admin/routes'
import { forgotPasswordRoute } from './features/auth/routes/ForgotPassword'
import { homeRoute, loginRoute } from './features/auth/routes/Login'
import { registerRoute } from './features/auth/routes/Register'
import { emailVerificationSuccessRoute } from './features/auth/routes/RequireEmailVerification'
import { verifyEmailSuccessRoute } from './features/auth/routes/VerifyEmailSuccess'
import { employeeRoute } from './features/employee/dashboard/routes/EmployeeRoute'
import {
    adminAccountManageRoute,
    branchManageRoute,
    movieDetailRoute,
    moviesManageRoute,
    refreshmentManageRoute,
    roleManageRoute,
    superAdminReportRoute,
    superAdminRoomsRoute,
    superAdminRoute,
    superAdminSeatsRoute,
    superAdminShowTimeDetailRoute,
    superAdminShowTimesRoute,
    superAdminSpecialDateRoute,
    superAdminStaffAccountsRoute,
    superAdminTypeDayRoute,
    typeSeatManageRoute
} from './features/super-admin/routes'
import { rootRoute } from './shared/routes/__root'
import { bookingEntryRoute, bookingRoute } from './features/booking/routes/booking.route'
import {
    bookingsRoute,
    reportsRoute,
    scheduleRoute,
    supportRoute
} from './features/employee/dashboard/routes/dashboard.routes'
import { paymentRoute, paymentSuccessRoute } from './features/payment/routes/payment.route'

// Create the route tree
export const routeTree = rootRoute.addChildren([
    homeRoute,
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    emailVerificationSuccessRoute,
    verifyEmailSuccessRoute,
    superAdminRoute,
    roleManageRoute,
    branchManageRoute,
    adminAccountManageRoute,
    moviesManageRoute,
    movieDetailRoute,
    typeSeatManageRoute,
    superAdminTypeDayRoute,
    superAdminSpecialDateRoute,
    superAdminRoomsRoute,
    superAdminSeatsRoute,
    superAdminShowTimesRoute,
    superAdminShowTimeDetailRoute,
    superAdminStaffAccountsRoute,
    superAdminReportRoute,
    refreshmentManageRoute,
    adminRoute,
    adminRoomsRoute,
    adminSeatsRoute,
    adminShowTimesRoute,
    adminShowTimeDetailRoute,
    adminShowTimeRoomDetailRoute,
    adminStaffAccountsRoute,
    adminRevenueStatisticsRoute,
    employeeRoute.addChildren([
        bookingRoute,
        bookingEntryRoute,
        reportsRoute,
        supportRoute,
        scheduleRoute,
        bookingsRoute
    ]),
    paymentRoute,
    paymentSuccessRoute
])
