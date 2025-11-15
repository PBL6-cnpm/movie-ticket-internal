import { createRoute } from '@tanstack/react-router'
import MovieRevenueReport from '../pages/MovieRevenueReport'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_REPORTS = 'reports'

export const superAdminReportRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_REPORTS}`,
    component: MovieRevenueReport
})
