import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import LoginView from '../views/LoginView.vue';
import QuickStart from '../views/QuickStart.vue';
import BulkDataUpload from '../views/BulkDataUpload.vue';
import ChangePassword from '../views/ChangePassword.vue';
import Catalogues from '../views/Catalogues.vue';
import DownloadReport from '../views/DownloadReport.vue';
import ViewAllUsers from '../views/ViewAllUsers.vue';
export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    linkActiveClass: 'active',
    routes: [

        { path: '/QuickStart', component: QuickStart },
        { path: '/Login', component: LoginView },
        { path: '/BulkDataUpload', component: BulkDataUpload },
        { path: '/ChangePassword', component: ChangePassword },
        { path: '/Catalogues', component: Catalogues },
        { path: '/DownloadReport', component: DownloadReport },
        { path: '/ViewAllUsers', component: ViewAllUsers }
    ]
});

router.beforeEach(async (to: any) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/Login'];
    const authRequired = !publicPages.includes(to.path);
    const auth = useAuthStore();
    if (authRequired && !auth.user) {
        console.log("unauthorized access detected, going back to login page")
        auth.returnUrl = to.fullPath;
        return '/Login';
    }
    if (auth.user && to.path == '/Login') {
        console.log('logged in user trying to go to /Login, redirecting to /QuickStart')
        return '/QuickStart'
    }
    if (to.path == "/ViewAllUsers" && auth.user.user_type != "admin") {
        console.log("unauthorized admin access detected, going back to Quick Start page")
        return '/QuickStart';
    }
});