interface NavigationProps {
    isAuthenticated: boolean
}

export default function Navigation({ isAuthenticated }: NavigationProps) {
    return (
        <nav className="hidden md:flex items-center space-x-8">
            <a
                href="/"
                className="text-primary hover:text-brand-secondary font-medium transition-colors"
            >
                Home
            </a>
            <a
                href="#"
                className="text-primary hover:text-brand-secondary font-medium transition-colors"
            >
                Movies
            </a>
            <a
                href="#"
                className="text-primary hover:text-brand-secondary font-medium transition-colors"
            >
                Theaters
            </a>
            <a
                href="#"
                className="text-primary hover:text-brand-secondary font-medium transition-colors"
            >
                Showtimes
            </a>
            {isAuthenticated && (
                <a
                    href="#"
                    className="text-primary hover:text-brand-secondary font-medium transition-colors"
                >
                    My Bookings
                </a>
            )}
        </nav>
    )
}
