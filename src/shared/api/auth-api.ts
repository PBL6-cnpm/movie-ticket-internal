import { apiClient } from './api-client'

const BASE_URL = '/auth'

export const register = async (
    email: string,
    password: string,
    fullName: string,
    confirmPassword: string
) => {
    const payload = {
        email,
        fullName,
        password,
        confirmPassword
    }

    return apiClient.post(`${BASE_URL}/register`, payload, {
        headers: { 'Content-Type': 'application/json' }
    })
}

export const login = async (email: string, password: string) => {
    return apiClient.post(
        `${BASE_URL}/login`,
        { email, password },
        {
            headers: { 'Content-Type': 'application/json' }
        }
    )
}

export const socialLogin = async (token: string) => {
    return apiClient.post(
        `${BASE_URL}/google/login`,
        { token },
        {
            headers: { 'Content-Type': 'application/json' }
        }
    )
}

export const logout = async () => {
    return apiClient.post(`${BASE_URL}/logout`, {
        headers: { 'Content-Type': 'application/json' }
    })
}

export const resendVerificationEmail = async (email: string) => {
    if (!email) return

    const payload = { email }

    return apiClient.post(`${BASE_URL}/email-verifications`, payload, {
        headers: { 'Content-Type': 'application/json' }
    })
}
