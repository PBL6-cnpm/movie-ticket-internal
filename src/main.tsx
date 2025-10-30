import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import './index.css'
import { routeTree } from './routeTree.gen'
import { queryClient } from './shared/api/query-client'

// Create a new router instance
const router = createRouter({
    routeTree
})

// Register things like loading components, error boundaries, etc
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                <ToastContainer />
            </QueryClientProvider>
        </StrictMode>
    )
}
