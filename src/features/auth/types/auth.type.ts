import type { Account } from './account.type'

export interface AuthState {
    user: Account | null
    isLoading: boolean
    isAuthenticated: boolean
    error: string | null
}

export type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: Account } }
    | { type: 'AUTH_ERROR'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' }

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    email: string
    password: string
    confirmPassword: string
    fullName: string
    branch_id?: string
}

export interface ResendVerificationEmailCredentials {
    email: string
}

// Responses
export interface LoginApiResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: {
        account: Account
        accessToken: string
        message: string
    }
}
