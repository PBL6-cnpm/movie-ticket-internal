import { useEffect, useRef, useState } from 'react'

interface SearchBarProps {
    onSearch?: (query: string) => void
    placeholder?: string
    className?: string
}

export default function SearchBar({
    onSearch,
    placeholder = 'Search movies, theaters...',
    className = ''
}: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleToggle = () => {
        setIsExpanded(!isExpanded)
        if (!isExpanded) {
            // Focus input when expanding
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        } else {
            // Clear search when collapsing
            setSearchQuery('')
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim() && onSearch) {
            onSearch(searchQuery.trim())
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleBlur = () => {
        // Delay collapse to allow for interactions
        setTimeout(() => {
            if (!searchQuery.trim()) {
                setIsExpanded(false)
            }
        }, 200)
    }

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isExpanded) {
                setIsExpanded(false)
                setSearchQuery('')
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isExpanded])

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSubmit} className="relative">
                {/* Search Button */}
                <button
                    type="button"
                    onClick={handleToggle}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Search"
                >
                    <svg
                        className="w-5 h-5 text-gray-600 hover:text-gray-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </button>

                {/* Expandable Input - Position Absolute to prevent layout shift */}
                {isExpanded && (
                    <div className="absolute top-0 right-0 z-[60]">
                        <div className="flex items-center bg-white shadow-2xl rounded-lg border border-gray-200">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder={placeholder}
                                    className="w-[400px] pl-4 pr-10 py-2 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <svg
                                            className="w-4 h-4 text-gray-400 hover:text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
