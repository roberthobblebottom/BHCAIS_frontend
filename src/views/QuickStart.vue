<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const { user: authUser } = storeToRefs(authStore);



</script>

<template>
    <div>
        <h1>Hi {{authUser?.username}}!</h1>
        <p>You're logged in with Vue 3 + Pinia & JWT!!</p>
       
    </div>
</template>