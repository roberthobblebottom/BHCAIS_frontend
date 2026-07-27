<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const { user: authUser } = storeToRefs(authStore);



</script>

<template>
    <div>
        <h1>Welcome to BHCAIS</h1>
       <h2>Quick Start:</h2>
       WIP
    </div>
</template>