<style>
.table-div {
    max-width: 1000px;
}

.check {
    display: flex;
    flex-wrap: wrap;
}
</style>
<template>
    <div class="q-pa-md dropdown">
        <h1>Catalogues</h1>
        <q-btn-dropdown color="primary" label="Select A Catalogue to View/Delete">
            <q-list>
                <q-item clickable v-close-popup @click='onItemClick("print")'>
                    <q-item-section>
                        <q-item-label>Prints</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click='onItemClick("oral_history")'>
                    <q-item-section>
                        <q-item-label>Oral Histories</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click='onItemClick("slide")'>
                    <q-item-section>
                        <q-item-label>Slides</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="onItemClick('negative')">
                    <q-item-section>
                        <q-item-label>Negatives</q-item-label>
                    </q-item-section>

                </q-item>
                <q-item clickable v-close-popup @click="onItemClick('library_and_archive')">
                    <q-item-section>
                        <q-item-label>Library and Archives</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-btn-dropdown>
        <div class="q-pa-md table-div">
            <!-- I have no idea how the column hiding works i just copied from the example: https://quasar.dev/vue-components/table#visible-columns-custom-top-fullscreen -->
            <q-table v-if="showTable" :rows="rows" :columns="columns" row-key="name" v-model:pagination="pagination"
                ref="tableRef" @request="onRequest" :visible-columns="visibleColumns" :filter="filter"
                :loading="loading">
                <template v-slot:top="props">
                    <div class="col-2 q-table__title"></div>

                    <div class="check" v-if="$q.screen.gt.xs">
                        <div v-for="v in columns" class="col">
                            <q-toggle v-model="visibleColumns" :val="v.name" :label="v.name" />
                        </div>
                    </div>
                    <q-select v-else v-model="visibleColumns" multiple borderless dense options-dense
                        :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                        option-value="name" style="min-width: 150px" />


                    <q-btn flat round dense :icon="props.inFullscreen ?
                        'fullscreen_exit' : 'fullscreen'" @click="props.toggleFullscreen" class="q-ml-md" />
                    <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </template>
            </q-table>
            {{ errorMessage }}
        </div>
    </div>

</template>
<script setup lang="ts">
import { onMounted, ref, useTemplateRef, type Ref, type ShallowRef } from 'vue';
import { fetchWrapper } from '../helpers/fetch-wrapper';
import { QTable } from 'quasar';
import { nextTick } from 'vue'
const columns: Ref<any[]> = ref([])
const visibleColumns: Ref<string[]> = ref([])
const rows = ref([])
const showTable = ref(false)
const errorMessage = ref("")
const loading = ref(false)
const filter = ref('')
const tableRef: ShallowRef<QTable | null> = useTemplateRef<QTable>("tableRef")
const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 10
})
let catalogueName = ""
defineExpose({ tableRef })

async function onRequest(props: any) {
    const { page, rowsPerPage, sortBy, descending, rowsNumber } = props.pagination
    const filterStr = props.filter

    loading.value = true
    // emulate server
    // setTimeout(async () => {
    console.log(props.pagination)
    let url = `${import.meta.env.VITE_API_URL}/getCatalogue/`
        + `?catalogue_name=${catalogueName}`
        + `&rows_per_page=${rowsPerPage}`
        + `&current_page_number=${page}`
        + `&filter_str=${filterStr}`
        + `&sort_by=${sortBy}`
        + `&descending=${descending}`
    const response = await fetchWrapper.get(url)
    const results = response.results
    const rowCounts = response.row_counts

    pagination.value.rowsNumber = rowCounts
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    if (results.length == 0) {
        errorMessage.value = "This is no results for " + catalogueName + " and search term " + filterStr
        loading.value = false
        return
    } else
        errorMessage.value = ""

    const temp: any = []
    const visibleColumnsTemp: any = []
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
        visibleColumnsTemp.push(h)
    }

    columns.value = temp
    rows.value = results
    visibleColumns.value = visibleColumnsTemp
    showTable.value = true
    loading.value = false
    await nextTick() // nextTick is much fast than setTimeout(,1500)
    // }, 1500)
}





async function onItemClick(catalogue_name1: string) {
    catalogueName = catalogue_name1
    showTable.value = true;
    await nextTick()
    tableRef.value!.requestServerInteraction()
}
</script>