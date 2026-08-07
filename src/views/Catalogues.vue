<script setup lang="ts">
function onItemClick() {
    console.log('Clicked on an Item')
}
</script>
<style>
.dropdown {}
</style>
<template>
    <div class="q-pa-md dropdown">
        <h1>Catalogues</h1>
        <q-btn-dropdown color="primary" label="Select A Catalogue to View/Delete">
            <q-list>
                <q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section>
                        <q-item-label>Prints</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section>
                        <q-item-label>Oral Histories</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section>
                        <q-item-label>Slides</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section>
                        <q-item-label>Negatives</q-item-label>
                    </q-item-section>

                </q-item>
                <q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section>
                        <q-item-label>Library and Archives</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-btn-dropdown>
    </div>
</template>