<template>
    <div class=" common  ">
        <div class="">
            <div class="header1 ">
                <h3>View Catalogue: </h3>
                <q-select rounded borderless v-model="dropDownCatalogueValue" class="dropdown q-pb-sm"
                    :options="catalogueNames" @update:model-value="onCatalogDropDownItemClick(dropDownCatalogueValue)">
                    <template #selected>
                        <div class="dropdown-selected-display">
                            <label :style="{ 'font-size': dropDownCatalogueNameFontSize }">

                                {{ formatOption(dropDownCatalogueValue) }}
                            </label>
                        </div>
                    </template>
                    <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                            <div>
                                <q-item-section>
                                    <q-item-label>
                                        {{ formatOption(scope.opt) }}
                                    </q-item-label>
                                </q-item-section>
                            </div>
                        </q-item>
                    </template>
                </q-select>
            </div>
            <!-- I have no idea how the column hiding works i just copied from the example: https://quasar.dev/vue-components/table#visible-columns-custom-top-fullscreen -->
            <q-table class="table-div col" v-if="showTable && catalogueName != ''" v-model:rows="rows"
                :columns="columns" :row-key="rowKey" v-model:pagination="pagination" ref="tableRef"
                @request="onRequestCatalogData" :visible-columns="visibleColumns" :filter="searchTerm"
                :loading="isLoadingTable" selection="multiple" v-model:selected="selectedRowsToBeDeleted"
                @selection="onSelectionForDeletion" :wrap-cells="true" :table-style="{ zoom: '60%' }" :dense="true">

                <!-- Headers -->
                <template v-slot:top="props">
                    <div class="row flex  items-end table-header">
                        <div class="col-5">
                            <q-btn-dropdown class="col-5 rounded-borders  " label="Columns Visibility">

                                <div class="q-pa-md rounded-borders">
                                    <div class="flex row justify-between">
                                        <p class="col-6">These toggles are for hiding individual rows</p>
                                        <q-btn class="col-3" text-color="black" size="md" color="orange"
                                            label="Hide All" @click="hideAllColumnsFunction" />
                                    </div>
                                    <div>
                                        <div class="check flex content-start" v-if="$q.screen.gt.xs">

                                            <div v-for="v in columns">
                                                <q-toggle v-model="visibleColumns" :val="v.name" :label="v.name" />
                                            </div>
                                        </div>
                                        <q-select v-else v-model="visibleColumns" multiple borderless dense
                                            options-dense :display-value="$q.lang.table.columns" emit-value map-options
                                            :options="columns" option-value="name" style="min-width: 150px" />
                                    </div>
                                </div>
                            </q-btn-dropdown>
                        </div>
                        <div class="col row flex items-end justify-end">
                            <q-btn color='red' size="md" class=" button" v-if="showDeleteSelectedButton"
                                @click="showConfirmDeleteSelectDialog = true">

                                <q-icon name="fa-regular fa-circle-xmark" class="q-mr-sm" size="sm"></q-icon>
                                Delete Selected</q-btn>


                            <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                @click="props.toggleFullscreen" class="q-ml-md"
                                :label="props.inFullscreen ? 'Exit Fullscreen mode' : 'Fullscreen Mode'" />


                            <p v-if="errorMessage != ''" class="col-4 q-ml-xl alert"> {{ errorMessage }}</p>

                            <q-input class="col-4 float-right q-ml-xl search-term-input " borderless dense
                                debounce="300" v-model="searchTerm" placeholder="Search">
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>

                        </div>
                    </div>
                </template>
            </q-table>

            <div class="" v-if="showDeleteSelectedButton"> Selected: {{selectedRowsToBeDeleted.map((v) => {
                return Object.values(v)[0]
            })}} </div>
            <p class="alert" v-if="!showTable"> {{ errorMessage }}</p>
        </div>

        <div class=" q-mt-xl" v-if="authStore.user.user_type == 'admin'">
            <q-btn color="red" size="md" @click="showConfirmDeleteAllDialogFunction">
                <q-icon name="fa-solid fa-square-xmark" class="q-mr-sm" size="sm"></q-icon>
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
                <q-btn :disable='isDeleteInProgress' class="q-ml-md" label="Delete" color="primary" :icon="isDeleteInProgress
                    ? 'fa-solid fa-spinner fa-spin-pulse'
                    : 'fa-regular fa-pen-to-square'" @click="deleteSelected">
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
                <q-btn label="Cancel" v-close-popup />
                <q-btn :disable='isDeleteInProgress' class="q-ml-md" label="Delete" color="blue" :icon="isDeleteInProgress
                    ? 'fa-solid fa-spinner fa-spin-pulse'
                    : 'fa-regular fa-pen-to-square'
                    " @click="deleteAllCatalogueData">
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
                All catalogue data has been deleted.
            </span>
            <q-card-section>
                <q-btn label="Ok" v-close-popup size="md" />
            </q-card-section>
        </q-card>
    </q-dialog>


</template>
<style scoped>
@import "../../public/css/main-content-variants.css";

.common {
    overflow-y: auto;
}

.header1 {
    display: flex;
    margin-bottom: 01vh;
}

h3 {
    margin-top: 0vh;
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
    font-size: xx-large;
    font-weight: 400;

}

.dropdown-selected-display {
    font-weight: 400;
    color: black;
    white-space: nowrap;
}

.dropdown {
    width: 50%;
    border-radius: 10px;
    margin-left: 1%;
    padding-left: 1vw;
    padding-right: 1vw;
    padding-bottom: 0.2vh;
    padding-top: 0%;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.alert {
    margin-top: 5%;
    color: red;
}

.table-div {
    border-radius: 15px !important;
}

.table-header {
    width: 100%
}

.button {
    float: none !important;
}
</style>

<script setup lang="ts">
import { ref, useTemplateRef, type Ref, type ShallowRef } from 'vue'
import { fetchWrapper } from '../helpers/fetch-wrapper'
import { QTable, QTr } from 'quasar'
import { nextTick } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import { catalogueNames } from '../constants'
import { formatOption } from '../helpers/otherHelperFunctions'
const dropDownCatalogueValue = ref("")
const dropDownCatalogueNameFontSize = ref("xx-large")
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
const showConfirmDeleteSelectDialog = ref(false)
const showConfirmDeleteAllDialog = ref(false)
const isDeleteInProgress = ref(false)
const authStore = useAuthStore()

defineExpose({ tableRef })

function hideAllColumnsFunction() {
    visibleColumns.value = []
}



async function onCatalogDropDownItemClick(catalogue_name1: string) {
    catalogueName.value = catalogue_name1
    if (catalogue_name1 == "legacy_and_miscellaneous_items_report")
        dropDownCatalogueNameFontSize.value = 'medium'
    else if (catalogue_name1 == "library_and_archive")
        dropDownCatalogueNameFontSize.value = 'x-large'
    showTable.value = true
    searchTerm.value = ""
    pagination.value.sortBy = ''
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
        token: authStore.user.token
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
    for (let h of Object.keys(results[0])) {
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
    await fetchWrapper.delete(url,
        {
            ids_to_be_deleted: selectedIds,
            catalogue_name: catalogueName.value,
        })


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
    showDeleteSelectedButton.value = false
}

function showConfirmDeleteAllDialogFunction() {
    showConfirmDeleteAllDialog.value = true
}

async function deleteAllCatalogueData() {

    isDeleteInProgress.value = true
    let url = `${import.meta.env.VITE_API_URL}/DeleteAllCatalogueData/`
    await fetchWrapper.delete(url)

    selectedRowsToBeDeleted.value = []

    await nextTick()
    if (tableRef.value != null)
        tableRef.value!.requestServerInteraction()

    isDeleteInProgress.value = false
    showConfirmDeleteAllDialog.value = false
    showAllDataDeletedDialog.value = true
}
</script>
