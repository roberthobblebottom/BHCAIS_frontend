<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
storeToRefs(authStore);
</script>

<template>
    <v-container>
        <v-row>

            <h1>Welcome to BHCAIS</h1>
        </v-row>
        <v-row>

            <h2>Quick Start:</h2>
        </v-row>
        <v-row>
            <p>
                WIP
            </p>
        </v-row>


    </v-container>
</template>