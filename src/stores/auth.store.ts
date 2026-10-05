import { defineStore } from 'pinia'
import { login } from '../helpers/fetch-wrapper'
import { router } from '../helpers/router'
const baseUrl = `${import.meta.env.VITE_API_URL}`
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
                const user = await login(`${baseUrl}/Login`, { username, password })
                // update pinia state
                this.user = user
                // store user details and jwt in local storage to keep user logged in between page refreshes
                sessionStorage.setItem('email', JSON.stringify(user.email))
                sessionStorage.setItem('user_id', JSON.stringify(user.user_id))
                sessionStorage.setItem('user_type', JSON.stringify(user.user_type))
                //tokens needed for backend routes user authentication
                // redirect to previous url or default to home page
                router.push(this.returnUrl || '/QuickStart')

            }
            catch (error) {
                return Promise.reject(error)
            }
        },
        logout() {
            this.user = null
            sessionStorage.clear()
            router.push('/Login')
        }
    },
    persist: {
        storage: sessionStorage
    }
}
)
