<template>
    <div class="q-pa-md large common">
        <h3>View Catalogues </h3>
        <q-btn-dropdown color="primary" class="dropdown"
            :label="catalogueName == '' ? 'Select A Catalogue to View/Delete' : catalogueName">
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
                <q-item clickable v-close-popup @click="onItemClick('legacy_and_miscellaneous_items_report')">
                    <q-item-section>
                        <q-item-label>Legacy and Misc Items Report</q-item-label>

                    </q-item-section>
                </q-item>
            </q-list>
        </q-btn-dropdown>
        <!-- I have no idea how the column hiding works i just copied from the example: https://quasar.dev/vue-components/table#visible-columns-custom-top-fullscreen -->
        <q-table class="table-div" v-if="showTable && catalogueName != ''" v-model:rows="rows" :columns="columns"
            :row-key="rowKey" v-model:pagination="pagination" ref="tableRef" @request="onRequest"
            :visible-columns="visibleColumns" :filter="searchTerm" :loading="isLoadingTable" selection="multiple"
            v-model:selected="selectedRowsToBeDeleted" @selection="onSelection" :wrap-cells="true">
            <template v-slot:top="props">
                <div class="table-header-div flex justify-between">
                    <q-btn-dropdown class="rounded-borders" label="hide columns">
                        <div class="q-pa-md rounded-borders">
                            <p>These toggles are for hiding individual rows</p>
                            <div class="check flex content-start" v-if="$q.screen.gt.xs">
                                <div v-for="v in columns">
                                    <q-toggle v-model="visibleColumns" :val="v.name" :label="v.name" />
                                </div>
                            </div>
                            <q-select v-else v-model="visibleColumns" multiple borderless dense options-dense
                                :display-value="$q.lang.table.columns" emit-value map-options :options="columns"
                                option-value="name" style="min-width: 150px" />
                        </div>
                    </q-btn-dropdown>
                    <q-input borderless dense debounce="300" v-model="searchTerm" placeholder="Search">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                    <button class="button" v-if="showDeleteSelectedButton" @click="confirm = true"><i
                            class="fa-solid fa-circle-xmark"></i>
                        Delete
                        Selected</button>
                </div>
            </template>
        </q-table>
        <div class="q-mt-md" v-if="showDeleteSelectedButton"> Selected: {{selectedRowsToBeDeleted.map((v) => {
            return Object.values(v)[0]
        })}} </div>
        <p class="alert"> {{ errorMessage }}</p>
    </div>
    <q-dialog v-model="confirm" persistent>
        <q-card class="column items-center 
            q-pb-none text-h6 dialog">
            <q-card-section class="  items-center column q-pb-none">
                <q-avatar icon="help_outline" color="primary" text-color="white" class="" />
                <span class="q-ml-sm">Are you sure you want to delete the selected rows ids:
                    {{selectedRowsToBeDeleted.map((v) => Object.values(v)[0]).join(',')}}
                    from {{ catalogueName }} table?
                </span>
            </q-card-section>
            <q-card-section class="row ">
                <q-btn label="Cancel" color="secondary" v-close-popup />
                <q-btn label="Delete" color="primary" v-close-popup @click="deleteSelected" />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<style scoped>
@import "../../public/css/main-content-variants.css";

.dropdown {
    font-size: x-large;
    width: 100%;
    border-radius: 15px;
}

.alert {
    color: red;
}

.table-div {
    border-radius: 15px !important;
}


.table-header-div {
    width: 100%;
}
</style>
<script setup lang="ts">
import { ref, useTemplateRef, type Ref, type ShallowRef } from 'vue';
import { fetchWrapper } from '../helpers/fetch-wrapper';
import { QTable, QTr } from 'quasar';
import { nextTick } from 'vue'
const columns: Ref<any[]> = ref([])
const visibleColumns: Ref<string[]> = ref([])

const rows: Ref<QTr[]> = ref([])
const showTable = ref(false)
const errorMessage = ref("")
const isLoadingTable = ref(false)
const searchTerm = ref('')
const tableRef: ShallowRef<QTable | null> = useTemplateRef<QTable>("tableRef")
const rowKey = ref('')
const selectedRowsToBeDeleted = ref([])
const showDeleteSelectedButton = ref(false)
const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 10
})
const catalogueName = ref("")
const confirm = ref(false)
defineExpose({ tableRef })



function onSelection(details: any) {
    // before selected reference is updated
    // if selected length < 1 and details.added = false (this is sellection adding or removing) 
    // then it is removing the only selected for a empty selected 
    // so the delete button should not be shown.
    if (selectedRowsToBeDeleted.value.length > 1
        || (details.added == true && details.rows.length > 0)
    )
        showDeleteSelectedButton.value = true
    else
        showDeleteSelectedButton.value = false
}

async function deleteSelected() {
    const selectedIds: any[] = []
    for (const x of selectedRowsToBeDeleted.value)
        selectedIds.push(Object.values(x)[0])

    const url = `${import.meta.env.VITE_API_URL}/DeleteSelectedRows/`
    try {
        await fetchWrapper.post(url,
            {
                ids_to_be_deleted: selectedIds,
                catalogue_name: catalogueName.value
            })
    } catch (error: any) {
        console.error(error)
    }

    const newRows = []
    for (const row of rows.value) {
        const x = Object.values({ ...row })[0]
        if (!selectedIds.includes(x))
            newRows.push(row)
    }
    rows.value = newRows
    selectedRowsToBeDeleted.value = []
    await nextTick()
    tableRef.value!.requestServerInteraction()
}

async function onRequest(props: any) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination
    const filterStr = props.filter

    isLoadingTable.value = true
    let url = `${import.meta.env.VITE_API_URL}/GetCatalogue/`
        + `?catalogue_name=${catalogueName.value}`
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
        errorMessage.value = "This is no results for " + catalogueName.value + " and search term " + filterStr
        isLoadingTable.value = false
        showTable.value = false
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
    isLoadingTable.value = false
    await nextTick() // nextTick is much fast than setTimeout(,1500)
}
async function onItemClick(catalogue_name1: string) {
    catalogueName.value = catalogue_name1
    showTable.value = true;
    await nextTick() // required for updating catalogue Name
    tableRef.value!.requestServerInteraction()
}
</script>