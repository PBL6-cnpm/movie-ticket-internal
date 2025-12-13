import { createRoute } from '@tanstack/react-router'
import UserAccountDetailPage from '../pages/UserAccountDetailPage'
import UserAccountsPage from '../pages/UserAccountsPage'
import { adminRoute } from './AdminRoute'

export const ADMIN_USER_ACCOUNTS = 'user-accounts'

export const adminUserAccountsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: `/${ADMIN_USER_ACCOUNTS}`,
    component: UserAccountsPage
})

export const adminUserAccountDetailRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: `/${ADMIN_USER_ACCOUNTS}/$accountId`,
    component: UserAccountDetailPage
})
