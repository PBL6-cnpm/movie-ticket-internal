import type { PermissionInRole } from '@/features/auth/types/role.type'
import { apiClient } from './api-client'

const BASE_URL = '/permissions'

export const getAllPermission = async () => {
    return apiClient.get(`${BASE_URL}`)
}

export const getPermissionByRoleId = async (id: string) => {
    return apiClient.get(`${BASE_URL}/${id}`)
}

export const savePermissionByRoleId = async (
    id: string,
    detailedPermissions: PermissionInRole[]
) => {
    console.log(id)
    console.log(detailedPermissions)
    return apiClient.post(`${BASE_URL}/${id}/save-permission`, {
        detailedPermissions
    })
}
