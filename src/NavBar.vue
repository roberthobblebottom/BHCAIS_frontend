<template>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <div>
        <nav v-if="authStore.user" v-show="authStore.user" class="sidebar">
            <div class="sidebar" v-if="authStore.user">
                <div class="logo">
                    <img src="/images/Group-1.svg" alt="LKCNHM Logo" />
                </div>
                <div class="user-message">
                    You are logged in as {{ authStore.user.email }}
                </div>
                <div class="nav-links">
                    <RouterLink to="/QuickStart" class="nav-item nav-link">Home</RouterLink>
                    <br>
                    <RouterLink to="/BulkDataUpload" class="nav-item nav-link">Bulk Data Upload</RouterLink>
                    <br>
                    <a @click="authStore.logout()" class="nav-item nav-link">Logout</a>
                </div>
            </div>
        </nav>
        <div class="main-content">

            <RouterView />
        </div>
    </div>
</template>

<style scoped>
@import '../public/css/navbar.css'
</style>

<script setup lang="ts">

import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth.store.ts';
const authStore = useAuthStore()
</script>