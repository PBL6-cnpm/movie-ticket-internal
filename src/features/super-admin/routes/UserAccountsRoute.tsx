import { createRoute } from '@tanstack/react-router'
import UserAccountDetailPage from '../pages/UserAccountDetailPage'
import UserAccountsPage from '../pages/UserAccountsPage'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_USER_ACCOUNTS = 'user-accounts'

export const superAdminUserAccountsRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_USER_ACCOUNTS}`,
    component: UserAccountsPage
})

export const superAdminUserAccountDetailRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_USER_ACCOUNTS}/$accountId`,
    component: UserAccountDetailPage
})
