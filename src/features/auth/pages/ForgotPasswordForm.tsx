'use client'

import Button from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            // TODO: Implement forgot password API call
            // const result = await forgotPassword({ email })

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000))

            setSuccess(true)
        } catch {
            setError('Failed to send reset email. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-brand flex items-center justify-center p-4">
                <div className="relative z-10 w-full max-w-md">
                    <Card
                        className="backdrop-blur-lg bg-surface border border-surface shadow-2xl"
                        style={{
                            backgroundColor: 'rgba(36, 43, 61, 0.8)',
                            borderColor: 'rgba(36, 43, 61, 0.5)',
                            borderRadius: '1px'
                        }}
                    >
                        <CardHeader className="space-y-1 pb-6">
                            <div className="text-center mb-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                                    <svg
                                        className="w-8 h-8 text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-center text-primary">
                                Check Your Email
                            </h2>
                            <p className="text-center text-secondary text-sm">
                                We've sent a password reset link to your email address
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center space-y-4">
                                <p className="text-sm text-secondary">
                                    Check your email and click the link to reset your password. If
                                    you don't see the email, check your spam folder.
                                </p>

                                <div className="pt-4">
                                    <Button
                                        onClick={() => navigate({ to: '/login' })}
                                        className="w-full btn-primary font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                                    >
                                        Back to Login
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="text-sm text-brand-primary hover:text-brand-secondary transition-colors cursor-pointer"
                                    >
                                        Try a different email address
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-secondary">
                            © 2024 Cinestech. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand flex items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-md">
                <Card
                    className="backdrop-blur-lg bg-surface border border-surface shadow-2xl"
                    style={{
                        backgroundColor: 'rgba(36, 43, 61, 0.8)',
                        borderColor: 'rgba(36, 43, 61, 0.5)',
                        borderRadius: '1px'
                    }}
                >
                    <CardHeader className="space-y-1 pb-6">
                        <div className="text-center mb-4">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full mb-4"
                                style={{
                                    background:
                                        'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))'
                                }}
                            >
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2v6m0 0a2 2 0 01-2 2 6 6 0 01-6 6v-13a6 6 0 016-6 2 2 0 012 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-primary">
                            Forgot Password?
                        </h2>
                        <p className="text-center text-secondary text-sm">
                            Don't worry! Enter your email and we'll send you a reset link
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/20 border border-red-400/50 text-red-300 rounded-lg backdrop-blur-sm">
                                <div className="flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-secondary"
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg
                                            className="w-5 h-5 text-secondary"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                            />
                                        </svg>
                                    </div>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="pl-10 input-field"
                                        style={{
                                            backgroundColor: '#3a4553',
                                            borderColor: '#3a4553',
                                            color: 'var(--brand-text)'
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-primary font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Sending reset link...
                                        </div>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>
                            </div>
                        </form>

                        {/* Additional Information */}
                        <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="w-5 h-5 text-blue-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-400">
                                        Password Reset Info
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-300">
                                        <p>
                                            The reset link will expire in 1 hour for security
                                            reasons.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-surface"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-transparent text-secondary">Or</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate({ to: '/login' })}
                                    className="w-full text-center py-2 px-4 border border-surface rounded-lg text-secondary hover:bg-surface hover:text-primary transition-all duration-200 cursor-pointer"
                                    style={{
                                        borderColor: 'var(--brand-surface)',
                                        backgroundColor: 'rgba(36, 43, 61, 0.3)'
                                    }}
                                >
                                    Back to Login
                                </button>

                                <button
                                    onClick={() => navigate({ to: '/register' })}
                                    className="w-full text-center py-2 px-4 border border-surface rounded-lg text-secondary hover:bg-surface hover:text-primary transition-all duration-200 cursor-pointer"
                                    style={{
                                        borderColor: 'var(--brand-surface)',
                                        backgroundColor: 'rgba(36, 43, 61, 0.3)'
                                    }}
                                >
                                    Create New Account
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-secondary">
                        © 2024 Cinestech. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordForm
