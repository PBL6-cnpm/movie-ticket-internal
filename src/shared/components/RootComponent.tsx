import { useAuth } from '@/features/auth/hooks/auth.hook'
import { Outlet } from '@tanstack/react-router'
import Header from '../layout/Header'

export const RootComponent = () => {
    const { isAuthenticated } = useAuth()

    const shouldShowHeader = !isAuthenticated

    return (
        <>
            {shouldShowHeader && <Header />}
            <main>
                <Outlet />
            </main>
        </>
    )
}
