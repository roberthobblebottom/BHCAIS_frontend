<template>


    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <div>
        <nav v-if="authStore.user" v-show="authStore.user" class="sidebar">
            <div class="sidebar" v-if="authStore.user">
                <div class="logo">
                    <img src="/images/Group-1.svg" alt="LKCNHM Logo" />
                </div>
                <div>
                    <div class="row">
                        <h3>BHCAIS</h3>
                    </div>
                    <div class="row">
                        You are logged in as {{ authStore.user.email }}
                    </div>
                    <div class="row">

                        <RouterLink to="/QuickStart" class="nav-item nav-link ">
                            <i class="fas fa-globe"></i> Home
                        </RouterLink>
                    </div>
                    <div class="row">
                        <RouterLink to="/BulkDataUpload" class="nav-item nav-link">
                            <i class="fas fa-sign-out-alt"></i>
                            Bulk Data Upload
                        </RouterLink>

                    </div>
                    <div class="row">
                        <i class="fas fa-globe"></i>
                        <a @click="authStore.logout()" class="nav-item nav-link">Logout</a>
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