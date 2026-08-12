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
            <q-table v-if="showTable" v-model:rows="rows" :columns="columns" :row-key="rowKey"
                v-model:pagination="pagination" ref="tableRef" @request="onRequest" :visible-columns="visibleColumns"
                :filter="filter" :loading="loading" selection="multiple" v-model:selected="selected"
                @selection="onSelection">
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
                    <button v-if="showDeleteSelectedButton" @click="deleteSelected">Delete Selected</button>
                </template>
            </q-table>
            <div class="q-mt-md"> Selected: {{ selected }} </div>
            {{ errorMessage }}
        </div @click="deleteSelected">
    </div>

</template>
<script setup lang="ts">
import { onMounted, ref, useTemplateRef, type Ref, type ShallowRef } from 'vue';
import { fetchWrapper } from '../helpers/fetch-wrapper';
import { QDialog, QTable, QTr } from 'quasar';
import { nextTick } from 'vue'
const columns: Ref<any[]> = ref([])
const visibleColumns: Ref<string[]> = ref([])
const rows: Ref<QTr[]> = ref([])
const showTable = ref(false)
const errorMessage = ref("")
const loading = ref(false)
const filter = ref('')
const tableRef: ShallowRef<QTable | null> = useTemplateRef<QTable>("tableRef")
const rowKey = ref('')
const selected = ref([])
const showDeleteSelectedButton = ref(false)
const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 10
})
let catalogueName: String = ""
defineExpose({ tableRef })
function onSelection(details: any) {
    // before selected reference is updated
    // if selected length < 1 and details.added = false (this is sellection adding or removing) 
    // then it is removing the only selected for a empty selected 
    // so the delete button should not be shown.
    if (selected.value.length > 1
        || (details.added == true && details.rows.length > 0)
    )
        showDeleteSelectedButton.value = true
    else
        showDeleteSelectedButton.value = false
    const temp = []
}

async function deleteSelected() {
    const selectedIds: any[] = []
    console.log(selected.value)
    for (const x of selected.value) {
        console.log("x", x)
        selectedIds.push(Object.values(x)[0])
    }
    console.log(selectedIds)

    let url = `${import.meta.env.VITE_API_URL}/deleteSelectedRows/`
    const response = await fetchWrapper.post(url,
        {
            ids_to_be_deleted: selectedIds,
            catalogue_name: catalogueName
        })
    if (!response.ok) {
        console.error("response not okay")
        console.log(response)
        return
    }
    const newRows = []
    for (const row of rows.value) {
        const x = Object.values({ ...row })[0]
        if (!selectedIds.includes(x))
            newRows.push(row)
    }
    rows.value = newRows

    selected.value = []

    await nextTick()
    tableRef.value!.requestServerInteraction()
}

async function onRequest(props: any) {
    const { page, rowsPerPage, sortBy, descending, rowsNumber } = props.pagination
    const filterStr = props.filter

    loading.value = true
    // emulate server
    // setTimeout(async () => {
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
    rowKey.value = columns.value[0].name
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