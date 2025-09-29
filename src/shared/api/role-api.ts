import { apiClient } from './api-client'

const BASE_URL = '/roles'

export const getAllRole = async () => {
    return apiClient.get(`${BASE_URL}`)
}
