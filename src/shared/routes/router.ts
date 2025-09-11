import { createRouter } from '@tanstack/react-router'

import { rootRoute } from '@/shared/routes/__root'

//features
import { adminRoute } from '@/features/admin/dashboard/routes'
import { loginRoute, registerRoute } from '@/features/auth/routes'
import { employeeRoute } from '@/features/employee/dashboard/routes'
import { homeRoute } from '@/features/home/routes'

const routeTree = rootRoute.addChildren([
    homeRoute,
    loginRoute,
    registerRoute,
    adminRoute,
    employeeRoute
])

export const router = createRouter({
    routeTree
})
