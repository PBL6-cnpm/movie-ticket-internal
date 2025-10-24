import {
    adminRoomsRoute,
    adminRoute,
    adminSeatsRoute,
    adminShowTimesRoute,
    adminStaffAccountsRoute
} from './features/admin/routes'
import { forgotPasswordRoute } from './features/auth/routes/ForgotPassword'
import { homeRoute, loginRoute } from './features/auth/routes/Login'
import { registerRoute } from './features/auth/routes/Register'
import { emailVerificationSuccessRoute } from './features/auth/routes/RequireEmailVerification'
import { verifyEmailSuccessRoute } from './features/auth/routes/VerifyEmailSuccess'
import {
    adminAccountManageRoute,
    branchManageRoute,
    refreshmentManageRoute,
    roleManageRoute,
    superAdminRoute,
    typeSeatManageRoute
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
    typeSeatManageRoute,
    refreshmentManageRoute,
    adminRoute,
    adminRoomsRoute,
    adminSeatsRoute,
    adminShowTimesRoute,
    adminStaffAccountsRoute
])
