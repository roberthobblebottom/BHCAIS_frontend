<template>

    <div class="q-pa-md large common">
        <h1>

            View Users
        </h1>
        <div class="row items-right">
            <button class="button">Create User</button>
        </div>
        <q-table class="table-div" v-model:rows="rows" :columns="columns" :row-key="rowKey" ref="tableRef"
            :loading="loading" :wrap-cells="true">

        </q-table>
    </div>
</template>
<script setup lang="ts">
import type { QTr } from 'quasar';
import { onBeforeMount, ref, type Ref } from 'vue';
import { fetchWrapper } from '../helpers/fetch-wrapper';
const columns: Ref<any[]> = ref([])
const rows: Ref<QTr[]> = ref([])
const rowKey = ref('user_id')
const loading = ref(false)
onBeforeMount(async () => {
    const url = `${import.meta.env.VITE_API_URL}/GetAllUsers/`
    const response = await fetchWrapper.get(url)

    const results = response.results
    console.log(results)
    rows.value = results
    const temp: any = []
    for (const h of Object.keys(results[0])) {
        temp.push({
            name: h,
            required: false,
            label: h,
            align: 'left',
            field: (row: any) => row[h],
            format: (val: any) => val == null ? "" : val,
            sortable: true
        })
    }

    columns.value = temp
})
</script>