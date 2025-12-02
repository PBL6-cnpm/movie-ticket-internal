import React, { useEffect } from 'react'

interface PageTransitionProps {
    children: React.ReactNode
    className?: string
    scrollToTop?: boolean
}

const PageTransition: React.FC<PageTransitionProps> = ({
    children,
    className = '',
    scrollToTop = true
}) => {
    useEffect(() => {
        if (scrollToTop) {
            // Use setTimeout to ensure it runs after any other scroll effects
            const timer = setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'instant'
                })
            }, 0)

            return () => clearTimeout(timer)
        }
    }, [scrollToTop])

    return <div className={`page-transition ${className}`}>{children}</div>
}

export default PageTransition
