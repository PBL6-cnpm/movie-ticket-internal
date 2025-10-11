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

    return apiClient.post(`${BASE_URL}/register`, payload)
}

export const login = async (email: string, password: string) => {
    return apiClient.post(`${BASE_URL}/login`, { email, password })
}

export const socialLogin = async (token: string) => {
    return apiClient.post(`${BASE_URL}/google/login`, { token })
}

export const logout = async () => {
    return apiClient.post(`${BASE_URL}/logout`)
}

export const resendVerificationEmail = async (email: string) => {
    if (!email) return

    const payload = { email }

    return apiClient.post(`${BASE_URL}/email-verifications`, payload)
}
