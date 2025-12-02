import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { ApiResponse } from '@/features/auth/types/base-response.type'
import Axios, { AxiosError, HttpStatusCode, type InternalAxiosRequestConfig } from 'axios'

export const apiClient = Axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Prevent multiple refresh token requests
let isRefreshing = false
let failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
}

const errorInterceptor = async (error: AxiosError) => {
    console.log('API Error Interceptor triggered:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message
    })

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    let errorObject = {
        success: false,
        statusCode: 500,
        message: 'An unexpected error occurred.'
    }

    if (error.response) {
        const backendError = error.response.data as ApiResponse<null>

        errorObject = {
            ...errorObject,
            ...backendError,
            statusCode: error.response.status
        }

        // Handle token expiration (401)
        if (
            error.response.status === HttpStatusCode.Unauthorized &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/refresh-tokens' // Don't retry refresh endpoint
        ) {
            if (isRefreshing) {
                // Queue this request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        if (originalRequest.headers && token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                        }
                        return apiClient(originalRequest)
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                console.log('Attempting to refresh token...')

                // Create a separate Axios instance to avoid infinite loop
                const refreshClient = Axios.create({
                    baseURL: import.meta.env.VITE_BASE_URL,
                    withCredentials: true,
                    timeout: 10000,
                    headers: { 'Content-Type': 'application/json' }
                })

                const refreshResponse = await refreshClient.post('/auth/refresh-tokens', {})
                console.log('Refresh token response:', refreshResponse.status)

                const tokenData = refreshResponse.data?.data

                // Update token in localStorage and Zustand store
                if (tokenData && tokenData.accessToken) {
                    const { updateAccessToken } = useAuthStore.getState()
                    updateAccessToken(tokenData.accessToken)

                    console.log('Token refreshed successfully')

                    // Process queued requests
                    processQueue(null, tokenData.accessToken)

                    // Update token in original request
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`
                    }

                    // Retry request with new token
                    return await apiClient(originalRequest)
                } else {
                    throw new Error('No access token in refresh response')
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)

                // Process queued requests with error
                processQueue(refreshError, null)

                // Don't auto-logout on payment success page to prevent interrupting user experience
                const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
                const currentHref = typeof window !== 'undefined' ? window.location.href : ''
                const isPaymentSuccessPage =
                    currentPath.includes('/payment/success') ||
                    currentHref.includes('/payment/success')

                if (!isPaymentSuccessPage) {
                    // If refresh token fails, log out user
                    const { logout } = useAuthStore.getState()
                    logout()

                    // Redirect to login page
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login'
                    }
                } else {
                    // On payment success page, just log the error without logging out
                    console.warn(
                        'Token refresh failed on payment success page, but not logging out to preserve user experience'
                    )
                }

                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }
    } else if (error.request) {
        errorObject.message = 'Unable to connect to server. Please check your network connection.'
    } else {
        errorObject.message = error.message
    }

    return Promise.reject(errorObject)
}

apiClient.interceptors.request.use(authRequestInterceptor)

apiClient.interceptors.response.use((response) => {
    return response
}, errorInterceptor)
