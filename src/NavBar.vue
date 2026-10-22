<template>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <q-layout view="hHh lpR fFf">
        <q-drawer show-if-above v-model="drawerLeft" :mini="miniState" style="background-color: #280401;"
            @mouseenter="miniState = !miniState && isPassedWidthThreshold" :breakpoint="100"
            @mouseleave="miniState = !miniState && isPassedWidthThreshold" v-if="isUserLoggedIn" side="left" :width=200>

            <!-- <div class="logo"> -->
            <!-- <img src="/images/Group-1.svg" alt="LKCNHM Logo" /> -->
            <!-- </div> -->
            <div class="sidebar">
                <div class="col">
                    <p class="app-name">BHCAIS</p>
                    <p class="user-details">User: {{ authStore.user.email }}</p>
                    <p class="user-details">User Type: {{ authStore.user.user_type }}</p>
                </div>
                <div>
                    <RouterLink to="/QuickStart" :class="miniState ? 'mini-row' : 'row'">
                        <i class="fas fa-globe q-mr-sm"></i> {{ miniState ? '' : 'Home' }}
                    </RouterLink>
                </div>
                <div>
                    <RouterLink to="/BulkDataUpload" :class="miniState ? 'mini-row' : 'row'">
                        <i class="fas fa-upload q-mr-sm"></i> {{ miniState ? '' : 'Bulk Data Upload' }}
                    </RouterLink>
                </div>
                <div>
                    <RouterLink to="/Catalogues" :class="miniState ? 'mini-row' : 'row'">
                        <i class="fas fa-rectangle-list q-mr-sm"></i> {{ miniState ? '' : 'Catalogues' }}
                    </RouterLink>

                </div>
                <div>
                    <RouterLink to="/DownloadReport" :class="miniState ? 'mini-row' : 'row'">
                        <i class="fas fa-file-arrow-down q-mr-sm"></i> {{ miniState ? '' : 'Download Report(s)' }}
                    </RouterLink>
                </div>

                <div>
                    <RouterLink to="/ChangePassword" :class="miniState ? 'mini-row' : 'row'">
                        <i class="fas fa-key q-mr-sm"></i> {{ miniState ? '' : 'Change Password' }}
                    </RouterLink>


                </div>
                <div v-if="authStore.user.user_type == 'admin'">
                    <RouterLink to="/UserManagement" :class="miniState ? 'mini-row' : 'row'">
                        <i class="fa-solid fa-users-gear q-mr-sm"></i>
                        {{ miniState ? '' : 'User Management' }}
                    </RouterLink>
                </div>

                <div>
                    <RouterLink to="/Login" @click="authStore.logout()" :class="miniState ? 'mini-row' : 'row'">
                        <i class="fa-solid fa-right-from-bracket q-mr-sm"></i> {{ miniState ? '' : 'Logout' }}
                    </RouterLink>
                    /
                </div>
            </div>
        </q-drawer>
        <q-page-container class="all">
            <q-page padding>
                <div class="main-content">
                    <RouterView />
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<style scoped>
@import '../public/css/navbar.css';

.mini-row {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30% !important;
}

.row {
    margin-top: 5% !important;
}
</style>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth.store.ts'
import { ref, watch, computed } from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { QBtn } from 'quasar'

QBtn.props.noCaps = { type: Boolean, default: true }

const authStore = useAuthStore()
const drawerLeft = ref(true)
const miniState = ref(false)
const widthThreshold = ref(700)
const isPassedWidthThreshold = ref(false)

const isUserLoggedIn = computed(() => !!authStore.user)

const handleWindowSizeChange = () => {
    const width = window.innerWidth
    if (width < widthThreshold.value) {
        miniState.value = true
        isPassedWidthThreshold.value = true
    } else {
        miniState.value = false
        isPassedWidthThreshold.value = false
    }
}


onMounted(() => {
    window.addEventListener("resize", handleWindowSizeChange)
    handleWindowSizeChange()
})
onBeforeUnmount(() => {
    window.removeEventListener("resize", handleWindowSizeChange)
})

watch(isUserLoggedIn, (_value: boolean) => {
    miniState.value = isPassedWidthThreshold.value
})

</script>