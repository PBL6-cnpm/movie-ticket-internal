import Axios, { type InternalAxiosRequestConfig } from 'axios'

if (!import.meta.env.VITE_BASE_URL) {
    throw new Error('env variable not set: VITE_BASE_URL')
}

const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
}

export const apiClient = Axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

apiClient.interceptors.request.use(authRequestInterceptor)
