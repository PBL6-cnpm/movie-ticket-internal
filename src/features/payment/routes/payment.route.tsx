import { rootRoute } from '@/shared/routes/__root'
import { createRoute } from '@tanstack/react-router'
import PaymentPage from '../pages/PaymentPage'
import PaymentSuccessPage from '../pages/PaymentSuccessPage'

export const paymentRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment',
    component: PaymentPage
})

export const paymentSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment/success',
    component: PaymentSuccessPage
})
