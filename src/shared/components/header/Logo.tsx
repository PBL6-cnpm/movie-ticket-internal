export default function Logo() {
    return (
        <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                <span
                    className="text-xl font-semibold text-brand-primary"
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        letterSpacing: '-0.01em'
                    }}
                >
                    CinemaBook
                </span>
            </a>
        </div>
    )
}
