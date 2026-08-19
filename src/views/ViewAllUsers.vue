<template>

    <div class="q-pa-md large common">
        <h1>

            View Users
        </h1>
        <q-table class="table-div" v-model:rows="rows" :columns="columns" :row-key="rowKey" ref="tableRef"
            :loading="loading" :wrap-cells="true">

        </q-table>
    </div>
</template>
<script setup lang="ts">
import type { QTr } from 'quasar';
import { ref, type Ref } from 'vue';
const columns: Ref<any[]> = ref([])
const rows: Ref<QTr[]> = ref([])
const rowKey = ref('user_id')
const loading = ref(false)
</script>