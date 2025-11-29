import { useEffect } from 'react'

/**
 * Hook to scroll to top when component mounts
 * Prevents automatic scrolling to bottom of page
 */
export const useScrollToTop = (shouldScroll: boolean = true) => {
    useEffect(() => {
        if (shouldScroll) {
            // Use setTimeout to ensure it runs after any other scroll effects
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'instant' // Use instant to avoid smooth scrolling
                })
            }, 0)
        }
    }, [shouldScroll])
}
