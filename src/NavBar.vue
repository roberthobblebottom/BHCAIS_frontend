<template>
    <div class="app-container bg-light">
        <nav v-if="authStore.user" v-show="authStore.user" class="navbar navbar-expand navbar-dark bg-dark">
            <div class="navbar-nav">
                You are logged in as {{ authStore.user }}

                <br>
                <RouterLink to="/QuickStart" class="nav-item nav-link">Home</RouterLink>
                <br>
                <a @click="authStore.logout()" class="nav-item nav-link">Logout</a>
            </div>
        </nav>
        <div class="container pt-4 pb-4">
            <RouterView />
        </div>
    </div>
</template>

<style scoped></style>

<script setup lang="ts">

import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth.store.ts';
const authStore = useAuthStore()
</script>