import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

interface NotificationPopupProps {
    message: string
    onClose: () => void
    duration?: number
    type?: 'error' | 'info'
}

const ErrorIcon = () => (
    <svg
        className="w-6 h-6 mr-3 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
)

const NotificationPopup: React.FC<NotificationPopupProps> = ({
    message,
    onClose,
    duration = 3000,
    type = 'info'
}) => {
    const [isClosing, setIsClosing] = useState(false)

    useEffect(() => {
        const closeTimer = setTimeout(() => {
            setIsClosing(true)
        }, duration)

        return () => clearTimeout(closeTimer)
    }, [duration])

    useEffect(() => {
        if (isClosing) {
            const unmountTimer = setTimeout(() => {
                onClose()
            }, 400) // Corresponds to the jump-out animation duration

            return () => clearTimeout(unmountTimer)
        }
    }, [isClosing, onClose])

    const animationClass = isClosing ? 'animate-jump-out' : 'animate-jump-in'

    const typeStyles = {
        error: 'bg-red-900/70 border-red-500/50 backdrop-blur-sm',
        info: 'bg-[var(--brand-surface)] border-white/10'
    }

    const popup = (
        <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-2xl text-white z-[100] flex items-center ${typeStyles[type]} ${animationClass}`}
        >
            {type === 'error' && <ErrorIcon />}
            <span>{message}</span>
        </div>
    )

    return ReactDOM.createPortal(popup, document.body)
}

export default NotificationPopup
