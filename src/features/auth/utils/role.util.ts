import type { Account } from '../types/account.type'

export enum Roles {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    STAFF = 'staff',
    CUSTOMER = 'customer'
}

export const checkRole = (account: Account | null, roleName: string): boolean => {
    if (!account || !account.roleNames) return false
    return account.roleNames[0].startsWith(roleName)
}

export const getRedirectPathByRole = (account: Account | null): string => {
    if (!account || !account.roleNames) return '/login'

    if (checkRole(account, Roles.SUPER_ADMIN)) return '/super-admin'
    if (checkRole(account, Roles.ADMIN)) return '/admin'
    if (checkRole(account, Roles.STAFF)) return '/staff'
    if (checkRole(account, Roles.CUSTOMER)) return '/'
    return '/abc'
}

export const hasRole = (account: Account | null, roleName: string): boolean => {
    if (!account || !account.roleNames) return false
    return account.roleNames.includes(roleName)
}
