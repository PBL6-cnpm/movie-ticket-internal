'use client'

import Button from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { useNavigate, useSearch } from '@tanstack/react-router'

const VerifyEmailSuccess = () => {
    const navigate = useNavigate()
    const { email } = useSearch({ from: '/verify-email' })

    const handleGoToLogin = () => {
        navigate({ to: '/login' })
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
                    <CardHeader className="space-y-1 pb-6 text-center">
                        {/* Success Icon */}
                        <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-center text-primary">
                            Email Verified Successfully!
                        </h2>
                        <p className="text-center text-secondary text-sm">
                            {email ? (
                                <>
                                    Your email{' '}
                                    <span className="text-brand-primary font-medium">{email}</span>{' '}
                                    has been successfully verified
                                </>
                            ) : (
                                'Your email has been successfully verified'
                            )}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="text-center space-y-4">
                            {/* Verified Icon */}
                            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-primary">
                                    Account Activated
                                </h3>
                                <p className="text-secondary text-sm leading-relaxed">
                                    Congratulations! Your account has been successfully activated.
                                    You can now log in and enjoy all the features of Cinestech.
                                </p>
                            </div>

                            <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <svg
                                        className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div className="text-left">
                                        <p className="text-green-300 text-sm font-medium">
                                            Welcome to Cinestech!
                                        </p>
                                        <p className="text-green-200 text-xs mt-1">
                                            Your account is now ready to use. Log in to start
                                            booking movies and enjoying our services.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleGoToLogin}
                                className="w-full btn-primary font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                    />
                                </svg>
                                Go to Login
                            </Button>

                            <div className="text-center">
                                <p className="text-xs text-secondary">
                                    Ready to explore?{' '}
                                    <button
                                        onClick={() => navigate({ to: '/' })}
                                        className="text-brand-primary hover:text-brand-secondary transition-colors font-medium"
                                    >
                                        Browse Movies
                                    </button>
                                </p>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="border-t border-surface pt-4">
                            <div className="text-center">
                                <p className="text-xs text-secondary">
                                    Need help?{' '}
                                    <a
                                        href="#"
                                        className="text-brand-primary hover:text-brand-secondary transition-colors"
                                    >
                                        Contact Support
                                    </a>
                                </p>
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

export default VerifyEmailSuccess
