import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import  LoginView  from '../views/LoginView.vue';
import QuickStart from '../views/QuickStart.vue';
import BulkDataUpload from '../views/BulkDataUpload.vue';
export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    linkActiveClass: 'active',
    routes: [
        
        { path: '/QuickStart', component: QuickStart },
        { path: '/Login', component: LoginView },
        {path:'/BulkDataUpload', component:BulkDataUpload }
    ]
});

router.beforeEach(async (to:any) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/Login'];
    const authRequired = !publicPages.includes(to.path);
    const auth = useAuthStore();
    if (authRequired && !auth.user) {
    console.log("unauthorized access detected, going back to homepage")
        auth.returnUrl = to.fullPath;
        return '/Login';
    }
});