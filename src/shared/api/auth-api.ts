import { apiClient } from './api-client'

const BASE_URL = '/auth'

export const register = async (email: string, password: string, fullName: string) => {
    if (!email || !password || !fullName) return

    console.log(email + ' ' + password + ' ' + fullName)

    const payload = {
        email,
        password,
        fullName
    }

    return apiClient.post(`${BASE_URL}/register`, payload, {
        headers: { 'Content-Type': 'application/json' }
    })
}

export const login = async (email: string, password: string) => {
    if (!email || !password) return

    return apiClient.post(
        `${BASE_URL}/login`,
        { email, password },
        {
            headers: { 'Content-Type': 'application/json' }
        }
    )
}
