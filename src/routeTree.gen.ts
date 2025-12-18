import {
    adminRevenueStatisticsRoute,
    adminRoomsRoute,
    adminRoute,
    adminSeatsRoute,
    adminShowTimeDetailRoute,
    adminShowTimeRoomDetailRoute,
    adminShowTimesRoute,
    adminStaffAccountsRoute,
    adminUserAccountDetailRoute,
    adminUserAccountsRoute
} from './features/admin/routes'
import { forgotPasswordRoute } from './features/auth/routes/ForgotPassword'
import { homeRoute, loginRoute } from './features/auth/routes/Login'
import { registerRoute } from './features/auth/routes/Register'
import { emailVerificationSuccessRoute } from './features/auth/routes/RequireEmailVerification'
import { verifyEmailSuccessRoute } from './features/auth/routes/VerifyEmailSuccess'
import { bookingEntryRoute, bookingRoute } from './features/booking/routes/booking.route'
import {
    bookingsRoute,
    reportsRoute,
    scheduleRoute,
    staffUserAccountDetailRoute,
    staffUserAccountsRoute,
    supportRoute
} from './features/employee/dashboard/routes/dashboard.routes'
import { employeeRoute } from './features/employee/dashboard/routes/EmployeeRoute'
import { paymentRoute, paymentSuccessRoute } from './features/payment/routes/payment.route'
import {
    adminAccountManageRoute,
    branchManageRoute,
    movieDetailRoute,
    moviesManageRoute,
    refreshmentManageRoute,
    roleManageRoute,
    superAdminBookingsRoute,
    superAdminReportRoute,
    superAdminRoomsRoute,
    superAdminRoute,
    superAdminSeatsRoute,
    superAdminShowTimeDetailRoute,
    superAdminShowTimeRoomDetailRoute,
    superAdminShowTimesRoute,
    superAdminSpecialDateRoute,
    superAdminStaffAccountsRoute,
    superAdminTypeDayRoute,
    superAdminUserAccountDetailRoute,
    superAdminUserAccountsRoute,
    typeSeatManageRoute,
    voucherManageRoute
} from './features/super-admin/routes'
import { rootRoute } from './shared/routes/__root'

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
    superAdminShowTimeRoomDetailRoute,
    superAdminStaffAccountsRoute,
    superAdminBookingsRoute,
    superAdminUserAccountsRoute,
    superAdminUserAccountDetailRoute,
    superAdminReportRoute,
    refreshmentManageRoute,
    voucherManageRoute,
    adminRoute,
    adminRoomsRoute,
    adminSeatsRoute,
    adminShowTimesRoute,
    adminShowTimeDetailRoute,
    adminShowTimeRoomDetailRoute,
    adminStaffAccountsRoute,
    adminUserAccountsRoute,
    adminUserAccountDetailRoute,
    adminRevenueStatisticsRoute,
    employeeRoute.addChildren([
        bookingRoute,
        bookingEntryRoute,
        reportsRoute,
        supportRoute,
        scheduleRoute,
        bookingsRoute,
        staffUserAccountsRoute,
        staffUserAccountDetailRoute
    ]),
    paymentRoute,
    paymentSuccessRoute
])
