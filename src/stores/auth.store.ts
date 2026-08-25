import { defineStore } from 'pinia'

import { login } from '../helpers/fetch-wrapper'
import { router } from '../helpers/router'

const baseUrl = `${import.meta.env.VITE_API_URL}`;
localStorage.clear();
export const useAuthStore = defineStore(
    'auth', {
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: JSON.parse(localStorage.getItem('user')!),
        returnUrl: null
    }),
    actions: {
        async login(username: string, password: string) {
            try {
                const user = await login(`${baseUrl}/Login`, { username, password });
                // update pinia state
                console.log('user', user)
                this.user = user;

                // store user details and jwt in local storage to keep user logged in between page refreshes
                localStorage.setItem('email', JSON.stringify(user.email));
                localStorage.setItem('user_id', JSON.stringify(user.user_id));
                localStorage.setItem('user_type', JSON.stringify(user.user_type))
                console.log('user_id', localStorage.getItem('user_id'))
                // redirect to previous url or default to home page
                router.push(this.returnUrl || '/QuickStart');

            }
            catch (error) {
                return Promise.reject(error);
            }

        },
        logout() {
            this.user = null;
            localStorage.removeItem('user_id');

            localStorage.removeItem('email');
            localStorage.removeItem('user_type');

            localStorage.clear();
            router.push('/Login');
        }
    },
    persist: {
        storage: sessionStorage
    }
}
);