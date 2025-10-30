import { createRoute } from '@tanstack/react-router'
import MovieDetailPage from '../pages/MovieDetailPage'
import MoviesManageForm from '../pages/MoviesManageForm'
import { superAdminRoute } from './SuperAdmin'

export const SUPER_ADMIN_MOVIES = 'movies'

export const moviesManageRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_MOVIES}`,
    component: MoviesManageForm
})

export const movieDetailRoute = createRoute({
    getParentRoute: () => superAdminRoute,
    path: `/${SUPER_ADMIN_MOVIES}/$id`,
    component: MovieDetailPage
})
