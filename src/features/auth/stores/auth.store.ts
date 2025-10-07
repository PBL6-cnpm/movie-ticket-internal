import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Account } from '../types/account.type'
import type { AuthState } from '../types/auth.type'

interface AuthStore extends Omit<AuthState, 'user'> {
    account: Account | null
    login: (account: Account, accessToken: string) => void
    logout: () => void
    updateAccessToken: (accessToken: string) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            account: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,

            login: (account, accessToken) => {
                if (!accessToken) {
                    set({
                        account,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    })
                } else {
                    localStorage.setItem('accessToken', accessToken)

                    // localStorage.setItem('refreshToken', tokens.refreshToken)
                    set({
                        account,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    })
                }
            },

            logout: () => {
                localStorage.removeItem('accessToken')
                // localStorage.removeItem('refreshToken')
                set({
                    account: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null
                })
            },

            updateAccessToken: (accessToken) => {
                localStorage.setItem('accessToken', accessToken)
            },

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                account: state.account,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)
