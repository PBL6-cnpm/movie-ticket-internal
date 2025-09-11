import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthState, UserWithDetails } from '../types/auth.type'

interface AuthStore extends Omit<AuthState, 'user'> {
    user: UserWithDetails | null
    login: (user: UserWithDetails, tokens: { accessToken: string; refreshToken: string }) => void
    logout: () => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,

            login: (user, tokens) => {
                localStorage.setItem('accessToken', tokens.accessToken)

                localStorage.setItem('refreshToken', tokens.refreshToken)
                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                })
            },

            logout: () => {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null
                })
            },

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)
