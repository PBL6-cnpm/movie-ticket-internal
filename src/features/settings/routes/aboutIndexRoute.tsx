import { createRoute, redirect } from '@tanstack/react-router'

//shared
import { rootRoute } from '@/shared/routes/__root'

// example check token + protected route
const hasToken = true

export const aboutIndexRoute = createRoute({
    getParentRoute: () => rootRoute,
    beforeLoad: async () => {
        if (!hasToken) {
            //   throw new Error("Unauthorized");
            return redirect({ to: '/' })
        }
    },
    path: 'about'
})
