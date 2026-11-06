import { defineStore } from 'pinia'
import { loginFetch } from '../helpers/fetch-wrapper'
import { router } from '../helpers/router'

const baseUrl = `${import.meta.env.VITE_API_URL}`

/**
 * login authentication and storage of user data
 */

export const useAuthStore = defineStore(
    'auth', {
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: JSON.parse(sessionStorage.getItem('user')!),
        returnUrl: null
    }),
    actions: {
        async login(username: string, password: string) {
            try {
                const user = await loginFetch(`${baseUrl}/Login`, { username, password })

                this.user = user

                // redirect to previous url or default to Quick Star page
                router.push(this.returnUrl || '/QuickStart')
            }
            catch (error) {
                //for returning error like invalid credentials.
                return Promise.reject(error)
            }
        },
        logout() {
            this.user = null
            sessionStorage.clear()
            router.push('/Login')
        }
    },
    persist: { storage: sessionStorage }
}
)
