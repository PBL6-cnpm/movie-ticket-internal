import { adminRoute } from './features/admin/dashboard/routes'
import { loginRoute } from './features/auth/routes/Login'
import { registerRoute } from './features/auth/routes/Register'
import { employeeRoute } from './features/employee/dashboard/routes'
import { homeRoute } from './features/home/routes/HomeRoute'
import { rootRoute } from './shared/routes/__root'

// Create the route tree
export const routeTree = rootRoute.addChildren([
    homeRoute,
    loginRoute,
    registerRoute,
    adminRoute,
    employeeRoute
])
