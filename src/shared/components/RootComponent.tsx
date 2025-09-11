import { useAuth } from '@/features/auth/hooks/auth.hook'
import { ROLE_IDS } from '@/features/auth/utils/auth.utils'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Header from '../layout/Header'

export const RootComponent = () => {
    const { user, isAuthenticated } = useAuth()

    const shouldShowHeader = !isAuthenticated || (user && user.role_id === ROLE_IDS.USER)

    return (
        <>
            {shouldShowHeader && <Header />}
            <main>
                <Outlet />
            </main>
            <TanStackRouterDevtools />
        </>
    )
}
