// 'use client'

// import Button from '@/shared/components/ui/button'
// import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
// import { useNavigate, useSearch } from '@tanstack/react-router'

// const VerifyEmailFailure = () => {
//     const navigate = useNavigate()
//     const { email } = useSearch({ from: '/verify-email-failure' })

//     const handleResendEmail = () => {
//         navigate({ to: '/resend-verification-email' })
//     }

//     const handleGotoLogin = () => {
//         navigate({ to: '/login' })
//     }

//     return (
//         <div className="min-h-screen bg-brand flex items-center justify-center p-4">
//             <div className="relative z-10 w-full max-w-md">
//                 <Card
//                     className="backdrop-blur-lg bg-surface border border-surface shadow-2xl"
//                     style={{
//                         backgroundColor: 'rgba(36, 43, 61, 0.8)',
//                         borderColor: 'rgba(36, 43, 61, 0.5)',
//                         borderRadius: '1px'
//                     }}
//                 >
//                     <CardHeader className="space-y-1 pb-6 text-center">
//                         {/* Failure Icon */}
//                         <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
//                             <svg
//                                 className="w-8 h-8 text-red-400"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
//                                 />
//                             </svg>
//                         </div>

//                         <h2 className="text-2xl font-bold text-center text-primary">
//                             Email Verification Failed!
//                         </h2>
//                         <p className="text-center text-secondary text-sm">
//                             {email ? (
//                                 <>
//                                     There was an error verifying your email{' '}
//                                     <span className="text-brand-primary font-medium">{email}</span>.
//                                 </>
//                             ) : (
//                                 'An error occurred during the email verification process.'
//                             )}
//                         </p>
//                     </CardHeader>

//                     <CardContent className="space-y-6">
//                         <div className="text-center space-y-4">
//                             <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
//                                 <div className="flex items-start space-x-3">
//                                     <svg
//                                         className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
//                                         fill="currentColor"
//                                         viewBox="0 0 20 20"
//                                     >
//                                         <path
//                                             fillRule="evenodd"
//                                             d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                                             clipRule="evenodd"
//                                         />
//                                     </svg>
//                                     <div className="text-left">
//                                         <p className="text-red-300 text-sm font-medium">
//                                             Invalid or Expired Link
//                                         </p>
//                                         <p className="text-red-200 text-xs mt-1">
//                                             Please try resending the verification email or contact support if the problem persists.
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="space-y-4">
//                             <Button
//                                 onClick={handleResendEmail}
//                                 className="w-full btn-primary font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
//                             >
//                                 <svg
//                                     className="w-5 h-5 mr-2"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                 >
//                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12V8a4 4 0 00-8 0v4m5 4h.01M5 12h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z"></path>
//                                 </svg>
//                                 Resend Verification Email
//                             </Button>

//                             <div className="text-center">
//                                 <p className="text-xs text-secondary">
//                                     Still having trouble?{' '}
//                                     <button
//                                         onClick={handleGoToSupport}
//                                         className="text-brand-primary hover:text-brand-secondary transition-colors font-medium"
//                                     >
//                                         Contact Support
//                                     </button>
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Additional Info */}
//                         <div className="border-t border-surface pt-4">
//                             <div className="text-center">
//                                 <p className="text-xs text-secondary">
//                                     Return to{' '}
//                                     <a
//                                         href="/login"
//                                         className="text-brand-primary hover:text-brand-secondary transition-colors"
//                                     >
//                                         Login Page
//                                     </a>
//                                 </p>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Footer */}
//                 <div className="mt-8 text-center">
//                     <p className="text-xs text-secondary">
//                         © 2024 Cinestech. All rights reserved.
//                     </p>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default VerifyEmailFailure;
