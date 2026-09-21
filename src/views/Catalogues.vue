<template>
    <div class="q-pa-md large common  ">
        <div class="outer">
            <h3>View Catalogues </h3>
            <q-btn-dropdown color="primary" class="dropdown"
                :label="catalogueName == '' ? 'Select A Catalogue to View/Delete' : catalogueName">
                <q-list>
                    <q-item clickable v-close-popup @click='onCatalogDropDownItemClick("print")'>
                        <q-item-section>
                            <q-item-label>Prints</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click='onCatalogDropDownItemClick("oral_history")'>
                        <q-item-section>
                            <q-item-label>Oral Histories</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click='onCatalogDropDownItemClick("slide")'>
                        <q-item-section>
                            <q-item-label>Slides</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="onCatalogDropDownItemClick('negative')">
                        <q-item-section>
                            <q-item-label>Negatives</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="onCatalogDropDownItemClick('library_and_archive')">
                        <q-item-section>
                            <q-item-label>Library and Archives</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup
                        @click="onCatalogDropDownItemClick('legacy_and_miscellaneous_items_report')">
                        <q-item-section>
                            <q-item-label>Legacy and Misc Items Report</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-btn-dropdown>
            <!-- I have no idea how the column hiding works i just copied from the example: https://quasar.dev/vue-components/table#visible-columns-custom-top-fullscreen -->
            <q-table class="table-div" v-if="showTable && catalogueName != ''" v-model:rows="rows" :columns="columns"
                :row-key="rowKey" v-model:pagination="pagination" ref="tableRef" @request="onRequestCatalogData"
                :visible-columns="visibleColumns" :filter="searchTerm" :loading="isLoadingTable" selection="multiple"
                v-model:selected="selectedRowsToBeDeleted" @selection="onSelectionForDeletion" :wrap-cells="true">

                <!-- Headers -->
                <template v-slot:top="props">
                    <div class="row flex  items-end table-header">
                        <div class="col-5">
                            <q-btn-dropdown class="col-5 rounded-borders  " label="hide columns">
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
                        </div>
                        <div class="col row flex items-end justify-end">
                            <button class="col-3 button" v-if="showDeleteSelectedButton"
                                @click="showConfirmDeleteSelectDialog = true"><i class="fa-solid fa-circle-xmark"></i>
                                Delete
                                Selected</button>

                            <p v-if="errorMessage != ''" class="col-4 q-ml-xl alert"> {{ errorMessage }}</p>

                            <q-input class="col-3 float-right q-ml-xl search-term-input " borderless dense
                                debounce="300" v-model="searchTerm" placeholder="Search">
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>
                        </div>
                    </div>
                </template>
            </q-table>

            <div v-if="showDeleteSelectedButton"> Selected: {{selectedRowsToBeDeleted.map((v) => {
                return Object.values(v)[0]
            })}} </div>
            <p class="alert" v-if="!showTable"> {{ errorMessage }}</p>
        </div>

        <div class="col-1 q-mt-xl" v-if="authStore.user.user_type == 'admin'">
            <q-btn rounded color="red" @click="showConfirmDeleteAllDialogFunction"> <i class="fa-solid fa-error"></i>
                PURGE ALL DATA
            </q-btn>
        </div>
    </div>

    <q-dialog v-model="showConfirmDeleteSelectDialog" persistent>
        <q-card class=" dialog ">
            <q-card-section>
                <q-avatar icon="help_outline" color="primary" text-color="white" class="" />
            </q-card-section>
            <span>Are you sure you want to delete the selected rows ids:
                {{selectedRowsToBeDeleted.map((v) => Object.values(v)[0]).join(',')}}
                from {{ catalogueName }} table?
            </span>
            <q-card-section>
                <q-btn label="Cancel" color="secondary" v-close-popup />
                <q-btn :disable='isDeleteInProgress' class="q-ml-md" label="Delete" color="primary"
                    @click="deleteSelected">
                    <i :class="isDeleteInProgress
                        ? 'fa-solid fa-spinner fa-spin-pulse'
                        : 'fa-solid fa-pen-to-square'"></i>
                </q-btn>
            </q-card-section>
        </q-card>
    </q-dialog>

    <q-dialog v-model="showConfirmDeleteAllDialog" persistent>
        <q-card class=" dialog ">
            <q-card-section>
                <q-avatar icon="help_outline" color="primary" text-color="white" class="" />
            </q-card-section>
            <span>MAKE SURE YOU HAVE DOWNLOADED THE BACKUPS VIA DOWNLOAD REPORTS.
                Are you sure you want to delete the all the data?
                THIS IS UNREVERTABLE.
            </span>
            <q-card-section>
                <q-btn label="Cancel" color="secondary" v-close-popup />
                <q-btn :disable='isDeleteInProgress' class="q-ml-md" label="Delete" color="primary"
                    @click="deleteAllCatalogueData">
                    <i :class="isDeleteInProgress
                        ? 'fa-solid fa-spinner fa-spin-pulse'
                        : 'fa-solid fa-pen-to-square'"></i>
                </q-btn>
            </q-card-section>
        </q-card>
    </q-dialog>

    <q-dialog v-model="showAllDataDeletedDialog">
        <q-card class=" dialog ">
            <q-card-section>
                <q-avatar icon="fa-regular fa-circle-check" color="primary" text-color="white" class="" />
            </q-card-section>
            <span>
                All Catalogue Data has been deleted.
            </span>
            <q-card-section>
                <q-btn label="Ok" v-close-popup />
            </q-card-section>
        </q-card>
    </q-dialog>


</template>
<style scoped>
@import "../../public/css/main-content-variants.css";

.large {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: auto
}

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

.table-header {
    width: 100%
}

.header-right {
    width: 40%;
}

.button {
    float: none !important;
    background-color: red;
    height: 10%;
}

.search-term-input {
    width: 10vw;

}
</style>

<script setup lang="ts">
import { ref, useTemplateRef, type Ref, type ShallowRef } from 'vue';
import { fetchWrapper } from '../helpers/fetch-wrapper';
import { QTable, QTr } from 'quasar';
import { nextTick } from 'vue'
import { useAuthStore } from '../stores/auth.store';

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
const showAllDataDeletedDialog = ref(false)
const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 10
})
const catalogueName = ref("")
const currentPrimaryKeyUsedForDeleteSelected = ref("")
const showConfirmDeleteSelectDialog = ref(false)
const showConfirmDeleteAllDialog = ref(false)
const isDeleteInProgress = ref(false)
const authStore = useAuthStore()

defineExpose({ tableRef })

async function onCatalogDropDownItemClick(catalogue_name1: string) {
    catalogueName.value = catalogue_name1
    showTable.value = true;
    selectedRowsToBeDeleted.value = []
    showDeleteSelectedButton.value = false
    await nextTick() // required for updating catalogue Name
    tableRef.value!.requestServerInteraction()
}

async function onRequestCatalogData(props: any) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination
    const filterStr = props.filter
    isLoadingTable.value = true
    const params = new URLSearchParams({
        catalogue_name: catalogueName.value,
        rows_per_page: rowsPerPage.toString(),
        current_page_number: page.toString(),
        filter_str: filterStr || '',
        sort_by: sortBy || '',
        descending: descending.toString(),
        current_user: authStore.user.token
    })

    const url = `${import.meta.env.VITE_API_URL}/GetCatalogue/?${params.toString()}`
    const response = await fetchWrapper.get(url)
    const results = response.results
    const rowCounts = response.row_counts

    pagination.value.rowsNumber = rowCounts
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    if (results.length == 0) {
        isLoadingTable.value = false
        if (filterStr == '') {
            errorMessage.value = "This is no results for " + catalogueName.value
            showTable.value = false
        }
        else {
            errorMessage.value = "No search results for search term " + searchTerm.value
            showTable.value = true
        }
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

    currentPrimaryKeyUsedForDeleteSelected.value = temp[0].name
    columns.value = temp
    rowKey.value = columns.value[0].name
    rows.value = results
    visibleColumns.value = visibleColumnsTemp
    showTable.value = true
    isLoadingTable.value = false
    await nextTick() // nextTick is much fast than setTimeout(,1500)
}

function onSelectionForDeletion(details: any) {
    // this function runs before selected reference is updated
    if (details.added == true)
        showDeleteSelectedButton.value = true
    else if (selectedRowsToBeDeleted.value.length - details.rows.length == 0)
        showDeleteSelectedButton.value = false
}

async function deleteSelected() {
    const selectedIds: any[] = []
    isDeleteInProgress.value = true
    for (const x of selectedRowsToBeDeleted.value)
        selectedIds.push(Object.values(x)[0])

    const url = `${import.meta.env.VITE_API_URL}/DeleteSelectedRows/`
    try {
        await fetchWrapper.delete(url,
            {
                ids_to_be_deleted: selectedIds,
                catalogue_name: catalogueName.value,
                current_primary_key: currentPrimaryKeyUsedForDeleteSelected.value,
                token: authStore.user.token
            })
    } catch (error: any) { console.error(error) }

    //setting up rows without the deleted ones
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

    isDeleteInProgress.value = false
    showConfirmDeleteSelectDialog.value = false
}

function showConfirmDeleteAllDialogFunction() {
    showConfirmDeleteAllDialog.value = true;
}

async function deleteAllCatalogueData() {

    isDeleteInProgress.value = true
    let url = `${import.meta.env.VITE_API_URL}/DeleteAllCatalogueData/?token=${useAuthStore().user.token}`
    await fetchWrapper.delete(url)
    selectedRowsToBeDeleted.value = []

    await nextTick()
    tableRef.value!.requestServerInteraction()

    isDeleteInProgress.value = false
    showAllDataDeletedDialog.value = false
}
</script>