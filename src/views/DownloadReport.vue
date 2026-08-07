<script setup lang="ts">
import { ref } from 'vue'

const start_date = ref('2019/02/01')
const end_date = ref('2019/02/01')
const search_term = ref('')
function onItemClick() {
    console.log('Clicked on an Item')
}
</script>
<style>
.dropdown {}
</style>
<template>

    <div class="q-pa-md dropdown">
        <form>

            <h1>Download Reports</h1>
            <q-btn-dropdown color="primary" label="Catalogues" multiple>
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
            <div>
                <q-btn-dropdown color="primary" label="Start Date">
                    <q-list>
                        <q-item clickable v-close-popup @click="onItemClick">
                            <q-item-section>
                                <q-date v-model="start_date" />
                            </q-item-section>
                        </q-item>

                    </q-list>
                </q-btn-dropdown>
                <q-btn-dropdown color="primary" label="End Date">
                    <q-list>
                        <q-item clickable v-close-popup @click="onItemClick">
                            <q-item-section>
                                <q-date v-model="end_date" />
                            </q-item-section>
                        </q-item>

                    </q-list>
                </q-btn-dropdown>
            </div>
            <q-input v-model="search_term" label="Search Term" />
            <Button>Download</Button>

        </form>
        <h2>Preview</h2>
    </div>
</template>