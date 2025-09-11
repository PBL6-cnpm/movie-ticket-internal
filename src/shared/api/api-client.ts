import Axios, { type InternalAxiosRequestConfig } from 'axios'

if (!import.meta.env.VITE_BASE_URL) {
    throw new Error('env variable not set: VITE_BASE_URL')
}

if (!import.meta.env.VITE_API_TOKEN) {
    throw new Error('env variable not set: VITE_API_TOKEN')
}

const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers || {}

    config.headers.authorization = import.meta.env.VITE_API_TOKEN

    return config
}

export const axios = Axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
})

axios.interceptors.request.use(authRequestInterceptor)
