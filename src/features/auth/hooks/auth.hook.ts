import { useAuthStore } from '../stores/auth.store'
import type {
    LoginCredentials,
    RegisterCredentials,
    Role,
    User,
    UserWithDetails
} from '../types/auth.type'
import {
    ROLE_IDS,
    getPermissionsByRoleId,
    validateEmail,
    validatePassword
} from '../utils/auth.utils'

// Mock users database with database-like structure
const MOCK_USERS: Array<{
    email: string
    password: string
    user: User & { role: Role }
}> = [
    {
        email: 'admin@example.com',
        password: '123456',
        user: {
            account_id: 'acc_001',
            branch_id: 'branch_001',
            email: 'admin@example.com',
            coin: 1000,
            status: true,
            role_id: ROLE_IDS.ADMIN,
            role: {
                role_id: ROLE_IDS.ADMIN,
                roleName: 'admin'
            },
            name: 'Admin User',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=ef4444&color=fff',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },
    {
        email: 'employee@example.com',
        password: '123456',
        user: {
            account_id: 'acc_002',
            branch_id: 'branch_001',
            email: 'employee@example.com',
            coin: 500,
            status: true,
            role_id: ROLE_IDS.EMPLOYEE,
            role: {
                role_id: ROLE_IDS.EMPLOYEE,
                roleName: 'employee'
            },
            name: 'Employee User',
            avatar: 'https://ui-avatars.com/api/?name=Employee+User&background=3b82f6&color=fff',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },
    {
        email: 'user@example.com',
        password: '123456',
        user: {
            account_id: 'acc_003',
            branch_id: 'branch_001',
            email: 'user@example.com',
            coin: 100,
            status: true,
            role_id: ROLE_IDS.USER,
            role: {
                role_id: ROLE_IDS.USER,
                roleName: 'user'
            },
            name: 'Charos',
            avatar: 'https://ui-avatars.com/api/?name=Regular+User&background=10b981&color=fff',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    }
]

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

            const mockUser = MOCK_USERS.find(
                (u) => u.email === credentials.email && u.password === credentials.password
            )

            if (!mockUser) {
                throw new Error('Invalid email or password')
            }

            if (!mockUser.user.status) {
                throw new Error('Account is deactivated')
            }

            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Use helper function to get permissions safely
            const userWithDetails: UserWithDetails = {
                ...mockUser.user,
                permissions: getPermissionsByRoleId(mockUser.user.role_id)
            }

            login(userWithDetails, {
                accessToken: `mock-access-token-${mockUser.user.role_id}`,
                refreshToken: `mock-refresh-token-${mockUser.user.role_id}`
            })

            return { success: true, user: userWithDetails }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed'
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

            const existingUser = MOCK_USERS.find((u) => u.email === credentials.email)
            if (existingUser) {
                throw new Error('User with this email already exists')
            }

            await new Promise((resolve) => setTimeout(resolve, 1000))

            const newUser: UserWithDetails = {
                account_id: `acc_${Date.now()}`,
                branch_id: credentials.branch_id || 'branch_001',
                email: credentials.email,
                coin: 50,
                status: true,
                role_id: ROLE_IDS.USER,
                role: {
                    role_id: ROLE_IDS.USER,
                    roleName: 'user'
                },
                permissions: getPermissionsByRoleId(ROLE_IDS.USER),
                name: credentials.name || 'New User',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.name || 'New User')}&background=6366f1&color=fff`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            login(newUser, {
                accessToken: 'mock-access-token-3',
                refreshToken: 'mock-refresh-token-3'
            })

            return { success: true }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed'
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
