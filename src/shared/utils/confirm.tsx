import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

interface ConfirmOptions {
    title: string
    message: string
    onConfirm: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
    confirmButtonColor?: string
}

export const showConfirm = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonColor = '#e86d28'
}: ConfirmOptions) => {
    confirmAlert({
        customUI: ({ onClose }) => {
            return (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

                    {/* Modal */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-6 h-6 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            {title}
                        </h2>

                        {/* Message */}
                        <p className="text-gray-600 dark:text-gray-300 text-center mb-6 whitespace-pre-line">
                            {message}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    onCancel?.()
                                    onClose()
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm()
                                    onClose()
                                }}
                                style={{ backgroundColor: confirmButtonColor }}
                                className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity font-medium shadow-lg"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        closeOnEscape: true,
        closeOnClickOutside: true
    })
}

// Delete confirm with red theme
export const showDeleteConfirm = ({
    title = 'Confirm Delete',
    message,
    onConfirm,
    onCancel,
    itemName
}: Omit<ConfirmOptions, 'confirmText' | 'cancelText' | 'confirmButtonColor'> & {
    itemName?: string
}) => {
    showConfirm({
        title,
        message: itemName
            ? `Are you sure you want to delete "${itemName}"?\n\nThis action cannot be undone.`
            : message,
        onConfirm,
        onCancel,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmButtonColor: '#dc2626' // red-600
    })
}
