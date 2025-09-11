interface AuthButtonsProps {
    onLogin?: () => void
    onSignup?: () => void
}

export default function AuthButtons({ onLogin, onSignup }: AuthButtonsProps) {
    return (
        <div className="hidden md:flex items-center gap-4">
            <a
                href="/login"
                className="text-sm text-secondary hover:text-brand-primary font-medium transition-colors"
                onClick={onLogin}
            >
                Login
            </a>
            <a href="/register" className="btn-primary text-sm" onClick={onSignup}>
                Sign Up
            </a>
        </div>
    )
}
