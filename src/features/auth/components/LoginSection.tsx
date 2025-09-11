'use client'

import Button from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../hooks/auth.hook'
import { getRedirectPathByRole } from '../utils/auth.utils'

const LoginForm = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, isLoading, error } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const result = await login({ email, password })
        if (result.success) {
            console.log('Login successful!')

            // Redirect dựa trên role của user
            if ('user' in result && result.user) {
                const redirectPath = getRedirectPathByRole(result.user.role_id)
                navigate({ to: redirectPath })
            }
        }
    }

    return (
        <Card className="max-w-md mx-auto card">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-primary">Login</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-4 bg-red-900/20 border border-red-500 text-red-400 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-primary mb-2"
                        >
                            Email
                        </label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-primary mb-2"
                        >
                            Password
                        </label>
                        <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="input-field"
                            required
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="btn-primary w-full">
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-secondary">
                        Don't have an account?{' '}
                        <a
                            href="/register"
                            className="text-secondary hover:text-primary transition-colors"
                        >
                            Sign up
                        </a>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default LoginForm
