import * as authApi from '@/shared/api/auth-api'
import { useAuthStore } from '../stores/auth.store'
import type {
    AccountResponse,
    AxiosErrorResponse,
    LoginCredentials,
    RegisterApiResponse,
    RegisterCredentials
} from '../types/auth.type'
import { validateEmail, validatePassword } from '../utils/auth.utils'

// Mock users database - keeping for reference but not used in production
// const MOCK_USERS: Array<{
//     email: string
//     password: string
//     user: User & { role: Role }
// }> = [...]

export const useAuth = () => {
    const {
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        logout,
        setLoading,
        setError,
        clearError
    } = useAuthStore()

    const handleLogin = async (credentials: LoginCredentials) => {
        try {
            setLoading(true)
            clearError()

            if (!validateEmail(credentials.email)) {
                throw new Error('Invalid email format')
            }

            if (!validatePassword(credentials.password)) {
                throw new Error('Password must be at least 6 characters')
            }

            // Call the actual API
            const response = await authApi.login(credentials.email, credentials.password)

            if (response && response.data) {
                const data = response.data.data
                console.log(data)

                if (!data || !data.accessToken) return

                const account = data.account

                // Create account with details from API response
                const accountWithDetails: AccountResponse = {
                    id: account.id,
                    branchId: account.branchId,
                    coin: account.coin,
                    email: account.email,
                    roleNames: account.roleNames,
                    status: account.status
                }

                login(accountWithDetails, {
                    accessToken: data.accessToken,
                    refreshToken: 'refreshToken'
                })

                return { success: true, user: accountWithDetails }
            } else {
                throw new Error('Invalid response from server')
            }
        } catch (error: unknown) {
            let errorMessage = 'Login failed'

            // Handle different types of errors from API
            const axiosError = error as AxiosErrorResponse

            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message
            } else if (axiosError.response?.status === 401) {
                errorMessage = 'Invalid email or password'
            } else if (axiosError.response?.status === 403) {
                errorMessage = 'Account is deactivated'
            } else if (axiosError.message) {
                errorMessage = axiosError.message
            } else if (error instanceof Error) {
                errorMessage = error.message
            }

            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (credentials: RegisterCredentials) => {
        try {
            setLoading(true)
            clearError()

            if (!validateEmail(credentials.email)) {
                throw new Error('Invalid email format')
            }

            if (!validatePassword(credentials.password)) {
                throw new Error('Password must be at least 6 characters')
            }

            if (credentials.password !== credentials.confirmPassword) {
                throw new Error('Passwords do not match')
            }

            if (!credentials.name || credentials.name.trim().length === 0) {
                throw new Error('Full name is required')
            }

            // Call the actual API
            const response = await authApi.register(
                credentials.email,
                credentials.password,
                credentials.name
            )

            if (response && response.data) {
                const registerData: RegisterApiResponse = response.data
                return { success: true, data: registerData }
            } else {
                throw new Error('Invalid response from server')
            }
        } catch (error: unknown) {
            let errorMessage = 'Registration failed'

            // Handle different types of errors from API
            const axiosError = error as AxiosErrorResponse

            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message
            } else if (axiosError.message) {
                errorMessage = axiosError.message
            } else if (error instanceof Error) {
                errorMessage = error.message
            }

            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
    }

    return {
        user,
        isLoading,
        isAuthenticated,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        clearError
    }
}
