<template>


    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <div>
        <nav v-if="authStore.user" v-show="authStore.user" class="sidebar">
            <div class="sidebar" v-if="authStore.user">
                <div class="logo">
                    <img src="/images/Group-1.svg" alt="LKCNHM Logo" />
                </div>
                <div>
                    <div class="col">
                        <p class="app-name">BHCAIS</p>
                        <p class="user-details">User: {{ authStore.user.email }}</p>
                        <p class="user-details">User Type: {{ authStore.user.user_type }}</p>
                    </div>
                    <div class="row" v-if="authStore.user.user_type == 'admin'">
                        <RouterLink to="/UserManagement" class="nav-item nav-link ">
                            <i class="fa-solid fa-users-gear"></i>
                            User Management
                        </RouterLink>
                    </div>

                    <div class="row">
                        <RouterLink to="/QuickStart" class="nav-item nav-link ">
                            <i class="fas fa-globe"></i> Home
                        </RouterLink>
                    </div>
                    <div class="row">
                        <RouterLink to="/BulkDataUpload" class="nav-item nav-link">
                            <i class="fas fa-upload"></i>
                            Bulk Data Upload
                        </RouterLink>

                    </div>
                    <div class="row">
                        <RouterLink to="/Catalogues" class="nav-item nav-link">
                            <i class="fas fa-rectangle-list"></i>
                            Catalogues
                        </RouterLink>

                    </div>
                    <div class="row">
                        <RouterLink to="/DownloadReport" class="nav-item nav-link">
                            <i class="fas fa-file-arrow-down"></i>
                            Download Report(s)
                        </RouterLink>

                    </div>
                    <div class="row">
                        <RouterLink to="/ChangePassword" class="nav-item nav-link">
                            <i class="fas fa-key"></i>
                            Change Password
                        </RouterLink>

                    </div>
                    <div class="row">
                        <RouterLink to="/Login" @click="authStore.logout()" class="nav-item nav-link">
                            <i class="fa-solid fa-right-from-bracket"></i>
                            logout
                        </RouterLink>
                    </div>
                </div>

            </div>
        </nav>
        <div class="main-content">
            <RouterView />
        </div>
    </div>
</template>

<style scoped>
@import '../public/css/navbar.css';
</style>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth.store.ts';
const authStore = useAuthStore()
</script>