// Admin route constants
export const BASE_ADMIN = 'admin'

// Admin sub-routes
export const ADMIN_ROOMS = 'rooms'
export const ADMIN_SEATS = 'seats'
export const ADMIN_SHOW_TIMES = 'show-times'
export const ADMIN_STAFF_ACCOUNTS = 'staff-accounts'
export const ADMIN_REVENUE_STATISTICS = 'revenue-statistics'

// Export all admin routes
export { adminRoute } from './AdminRoute'
export { adminRevenueStatisticsRoute } from './RevenueStatisticsRoute'
export { adminRoomsRoute } from './RoomsRoute'
export { adminSeatsRoute } from './SeatsRoute'
export { adminShowTimeDetailRoute, adminShowTimesRoute } from './ShowTimeRoute'
export { adminStaffAccountsRoute } from './StaffAccountsRoute'
