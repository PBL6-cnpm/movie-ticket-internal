import { createRoute } from '@tanstack/react-router'
import RevenueStatisticsPage from '../pages/RevenueStatisticsPage'
import { adminRoute } from './AdminRoute'

export const adminRevenueStatisticsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/revenue-statistics',
    component: RevenueStatisticsPage
})
