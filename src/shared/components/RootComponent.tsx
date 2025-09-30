import { useAuth } from '@/features/auth/hooks/auth.hook'
import { Outlet } from '@tanstack/react-router'
import Header from '../layout/Header'

export const RootComponent = () => {
    const { user, isAuthenticated } = useAuth()

    const shouldShowHeader = !isAuthenticated || user

    return (
        <>
            {shouldShowHeader && <Header />}
            <main>
                <Outlet />
            </main>
        </>
    )
}
