'use client'

import Button from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { useNavigate, useSearch } from '@tanstack/react-router'

const EmailVerificationSuccess = () => {
    const navigate = useNavigate()
    const { email } = useSearch({ from: '/email-verification' })

    const handleOpenGmail = () => {
        // Mở Gmail trong tab mới
        window.open('https://mail.google.com/', '_blank')
    }

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
                            Registration Successful!
                        </h2>
                        <p className="text-center text-secondary text-sm">
                            {email ? (
                                <>
                                    Please check{' '}
                                    <span className="text-brand-primary font-medium">{email}</span>{' '}
                                    to verify your account
                                </>
                            ) : (
                                'Please check your email to verify your account'
                            )}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="text-center space-y-4">
                            {/* Email Icon */}
                            <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-primary">
                                    Verify Your Email Address
                                </h3>
                                <p className="text-secondary text-sm leading-relaxed">
                                    We've sent a verification link to{' '}
                                    {email ? (
                                        <span className="text-brand-primary font-medium">
                                            {email}
                                        </span>
                                    ) : (
                                        'your email address'
                                    )}
                                    . Click the button below to open Gmail and find the verification
                                    email.
                                </p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <svg
                                        className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div className="text-left">
                                        <p className="text-blue-300 text-sm font-medium">
                                            Don't see the email?
                                        </p>
                                        <p className="text-blue-200 text-xs mt-1">
                                            Check your spam folder or contact support if you don't
                                            receive it within 10 minutes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleOpenGmail}
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
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                Open Gmail
                            </Button>

                            <Button
                                onClick={handleGoToLogin}
                                className="w-full bg-transparent border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
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
                                Go to Login Page
                            </Button>

                            <button
                                onClick={() => window.location.reload()}
                                className="w-full text-center py-2 text-sm text-secondary hover:text-primary transition-colors"
                            >
                                Didn't receive the email?
                                <span className="text-brand-primary hover:text-brand-secondary ml-1 font-medium">
                                    Resend verification
                                </span>
                            </button>

                            {/* Demo button - Remove in production */}
                            <button
                                onClick={() =>
                                    navigate({
                                        to: '/verify-email',
                                        search: { email: email || 'demo@example.com' }
                                    })
                                }
                                className="w-full text-center py-2 text-xs text-gray-400 hover:text-gray-300 transition-colors border-t border-gray-600 mt-4 pt-4"
                            >
                                🔧 Demo: Simulate Email Verified
                            </button>
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

export default EmailVerificationSuccess
