import { useAuth } from '@/features/auth/hooks/auth.hook'
import { Outlet } from '@tanstack/react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    )
}
