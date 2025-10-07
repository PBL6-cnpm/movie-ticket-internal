import { forgotPasswordRoute } from './features/auth/routes/ForgotPassword'
import { loginRoute } from './features/auth/routes/Login'
import { registerRoute } from './features/auth/routes/Register'
import { emailVerificationSuccessRoute } from './features/auth/routes/RequireEmailVerification'
import { verifyEmailSuccessRoute } from './features/auth/routes/VerifyEmailSuccess'
import { branchManageRoute, roleManageRoute, superAdminRoute } from './features/super-admin/routes'
import { rootRoute } from './shared/routes/__root'

// Create the route tree
export const routeTree = rootRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    emailVerificationSuccessRoute,
    verifyEmailSuccessRoute,
    superAdminRoute,
    roleManageRoute,
    branchManageRoute
])
