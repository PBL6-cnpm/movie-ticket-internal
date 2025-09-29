import { apiClient } from './api-client'

const BASE_URL = '/roles'

export const getAllRole = async () => {
    return apiClient.get(`${BASE_URL}`)
}

export const createNewRole = async (name: string) => {
    return apiClient.post(`${BASE_URL}`, {
        name
    })
}

export const deleteRole = async (id: string) => {
    return apiClient.post(`${BASE_URL}/delete`, {
        id
    })
}
