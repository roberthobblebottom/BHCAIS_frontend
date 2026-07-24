import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import  LoginView  from '../views/LoginView.vue';
import QuickStart from '../views/QuickStart.vue';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    linkActiveClass: 'active',
    routes: [
        { path: '/QuickStart', component: QuickStart },
        { path: '/Login', component: LoginView }
    ]
});

router.beforeEach(async (to:any) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/Login'];
    const authRequired = !publicPages.includes(to.path);
    const auth = useAuthStore();

    if (authRequired && !auth.user) {
        auth.returnUrl = to.fullPath;
        return '/Login';
    }
});