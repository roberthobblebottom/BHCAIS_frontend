<template>
    <div class=" common medium  ">
        <q-form validation-observer @submit.prevent="onSubmit">
            <h3>Download Reports</h3>

            <q-select v-model="selectCatalogues" @clear="onCatalogueSelectClear" @add="onCatalogueSelectAdd"
                @remove="onCatalogueSelectRemove" class="select" :options="catalogueOptions"
                label="Select catalogue(s). " multiple clearable hint="Click on the same catalogue to unselect"
                :error-message="errorMessage" :error="errorMessage != ''"></q-select>

            <!-- inner div for one or more search term -->
            <div class="col search-terms-div">
                <div class="row justifiy-between items-end">
                    <label class="col-6 search-terms-label">Search Terms
                        (Optional):</label>
                    <div class="col flex justify-end">

                        <q-btn color="red" size="md" class="" @click.prevent="clearAllSearchTerm">

                            <q-icon name="fa-regular fa-x" class="q-mr-sm" size="sm"></q-icon>
                            Clear </q-btn>
                        <q-btn color="blue" size="md" class="q-ml-md " @click.prevent="addSearchTerm">

                            <q-icon name="fas fa-add" class="q-mr-sm" size="sm"></q-icon>
                            Add </q-btn>

                    </div>
                </div>

                <div class="row " v-for="x of selectedSearchTerms">
                    <!--- Note: No more multiple selection. 
                    there are problems manpilation with this value in 3 times nested reference. 
                    also it is hard to see if you have selected multiple catalogues in one search fields--->
                    <q-select v-model=x[0] class="select col" :options="filteredCatalogueFields"
                        label="Select catalogue field" @filter="filterFunction" clearable style="width: 250px" use-input
                        input-debounce="0">
                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey"> No results </q-item-section>
                            </q-item>
                        </template>
                    </q-select>

                    <q-input v-model=x[1] class="col" :style="{ ' margin-left': '5px' }" label="Search Term" />
                </div>
            </div>

            <q-btn color="blue" size="md" :disable='isDownloading' class="flex float-right q-mt-md " @click="onSubmit">

                <q-icon :name="isDownloading
                    ? 'fa-solid fa-spinner fa-spin-pulse'
                    : 'fas fa-file-arrow-down'" class="q-mr-sm" size="sm"></q-icon>
                {{ isDownloading ? 'Currently downloading...' : 'Download' }}
            </q-btn>
        </q-form>

        <q-dialog v-model="showCataloguesWithNoResultsAlertDialog">
            <q-card class="dialog">
                <q-card-section>
                    <q-avatar class="" icon="error" color="primary" text-color="white" />
                </q-card-section>

                <label> {{ showNoResultMessage
                    ? "All catalogues do not have results."
                    : "There are no results from these catalogues: \n"
                    + cataloguesWithNoResults.join(",")
                    + "\n They will not be included in the zip file." }}</label>

                <q-btn class="q-mt-md" label="Ok" color="primary" size="md" v-close-popup autofocus />
            </q-card>
        </q-dialog>
    </div>
</template>
<style scoped>
@import '../../public/css/main-content-variants.css';
@import '../../public/css/dialog.css';


.search-terms-div {
    margin-top: 2vh;
    background-color: rgb(253, 253, 253);
}




.search-terms-label {
    color: grey !important;
    font-size: 16px;
}
</style>

<script setup lang="ts">
//partial credits: https://stackblitz.com/edit/vee-validate-v4-quasar-framework?file=src%2FApp.vue
import { nextTick, ref, toRaw, type MaybeRefOrGetter, type Ref } from 'vue'
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { streamFilesDownload } from '../helpers/fetch-wrapper';
import { downloadZip, type InputWithoutMeta } from 'client-zip';
import { Buffer } from 'buffer';
import { catalogueNames, getHeaderDict } from '../constants';
import { useAuthStore } from '../stores/auth.store';

const catalogueOptions = ref(catalogueNames)
const allCatalogueFields: Ref<string[]> = ref(["Select All"])
const filteredCatalogueFields: Ref<string[]> = ref(["Select All"])
const selectedSearchTerms = ref([["", ""]]) // for list of select catalogue field and written search term pairs
const errorMessage = ref("")
const isDownloading = ref(false)

//for catalogues with no results:
const cataloguesWithNoResults: Ref<string[]> = ref([])
const showCataloguesWithNoResultsAlertDialog = ref(false)
const showNoResultMessage = ref(false)

//field validation
const schema = yup.object().shape({
    selectCatalogues: yup.array()
        .of(yup.string()
            .oneOf(catalogueNames, 'Invalid Catalogue'))
        .required("Selection of catalogues is required"),
});

const { defineField, handleSubmit } = useForm({
    validationSchema: schema,
    initialValues: { selectCatalogues: [] },
});
const quasarConfig = (state: any) => ({
    props: {
        error: !!state.errors[0],
        'error-message': state.errors[0],
    },
});
const [selectCatalogues, selectCataloguesProps] = defineField("selectCatalogues" as MaybeRefOrGetter, quasarConfig)






function onCatalogueSelectAdd(details: { index: number; value: string; }) {
    const currentlySelected: string[] = selectCatalogues.value!
    currentlySelected.push(details.value)
    setCatalogueFieldOptionsForSomeSelectUIs(currentlySelected)
}

function onCatalogueSelectRemove(details: { index: number; value: string; }) {
    const currentlySelected: string[] = selectCatalogues.value!
    currentlySelected.splice(currentlySelected.indexOf(details.value), 1)
    setCatalogueFieldOptionsForSomeSelectUIs(currentlySelected)
    for (let aSearchTerm of selectedSearchTerms.value) {
        const cats = toRaw(aSearchTerm[0]!)
        if (cats.length == 0)
            continue
        if (cats.includes(details.value))
            selectedSearchTerms.value.splice(selectedSearchTerms.value.indexOf(aSearchTerm), 1)
        if (selectedSearchTerms.value.length == 0)
            selectedSearchTerms.value = [["", ""]]
    }
}

function setCatalogueFieldOptionsForSomeSelectUIs(currentlySelected: string[]) {
    allCatalogueFields.value = ["Select All"]
    filteredCatalogueFields.value = ["Select All"]
    for (const x of currentlySelected) {
        let key = x as keyof typeof getHeaderDict; // for using string as keys for the object
        const newFields = []
        for (const x1 of getHeaderDict[key])
            newFields.push(key + " " + x1)
        allCatalogueFields.value = allCatalogueFields.value.concat(newFields)
        filteredCatalogueFields.value = allCatalogueFields.value
    }
}

function onCatalogueSelectClear() {
    clearAllSearchTerm()
    allCatalogueFields.value = ["Select All"]
    selectCatalogues.value = []
}

function clearAllSearchTerm() {
    selectedSearchTerms.value = [["", ""]]

}

function filterFunction(filterTerm: string, update: any) {
    if (filterTerm.length > 2)
        update(() => {
            const new_fields = []
            for (const catalogueField of allCatalogueFields.value)
                if (catalogueField.includes(filterTerm))
                    new_fields.push(catalogueField)
            filteredCatalogueFields.value = new_fields
        })
    else
        update(() => filteredCatalogueFields.value = allCatalogueFields.value)
}

function addSearchTerm() {
    selectedSearchTerms.value.push(["", ""])
}



const onSubmit = handleSubmit(async (_values) => {
    isDownloading.value = true

    if (selectCatalogues.value.length == 0) {
        selectCataloguesProps.value['error'] = true
        selectCataloguesProps.value['error-message'] = "Please select a catalogue(s)."
        errorMessage.value = "Please Select a catalogue."
        nextTick()
        return
    }

    //setting up search terms to be sent
    const searchTermsToBeSent: any = {}
    for (const cat of selectCatalogues.value) {
        searchTermsToBeSent[cat] = {}
        for (const catalogueFieldAndSearchTermPair of selectedSearchTerms.value) {
            if (catalogueFieldAndSearchTermPair[0] == null || catalogueFieldAndSearchTermPair[1] == null)
                continue
            const fieldsWithCatPrefix = catalogueFieldAndSearchTermPair[0]!.toString().split(",")
            for (const fieldWithCatPrefix of fieldsWithCatPrefix) {
                const field = fieldWithCatPrefix.replace(cat, "").trim()

                //only add search term if the pair are not empty
                if (fieldWithCatPrefix.includes(cat) && field != ""
                    && (catalogueFieldAndSearchTermPair[1] as String).trim() != "")
                    searchTermsToBeSent[cat][field] = catalogueFieldAndSearchTermPair[1]
            }
        }
        if (Object.keys(searchTermsToBeSent[cat]).length == 0)
            delete searchTermsToBeSent[cat]
    }

    const queryData = {
        selected_catalogues: [...selectCatalogues.value],
        search_terms: { ...searchTermsToBeSent },
        token: useAuthStore().user.token
    }

    let url = `${import.meta.env.VITE_API_URL}/DownloadFiles/`
    const allCatalogueResultsInCSVs = []
    cataloguesWithNoResults.value = []
    showNoResultMessage.value = false
    let reader = null

    try {
        const response = await streamFilesDownload(url, queryData)
        reader = response.body!.getReader()
    }
    catch (err) { console.error(err) }

    // reading the chunks streamed
    let isReadDone = false;
    const textDecoder = new TextDecoder()
    let results: { [index: string]: any[] } = {}
    let currentCatalogue = ""
    while (!isReadDone) {
        let { value, done } = await reader!.read();
        isReadDone = done
        if (isReadDone)
            break
        const decodedValue = textDecoder.decode(value)
        for (const lineString of decodedValue.split('\n')) {
            if (lineString == "")
                continue
            const obj = JSON.parse(lineString)
            if (Object.keys(obj)[0] == 'catalogue_name') {
                currentCatalogue = Object.values(obj)[0] as string
                results[currentCatalogue] = []

            } else {
                if (currentCatalogue == "")
                    throw new Error("currentCatalogue is a empty string. it should be populated")
                results[currentCatalogue]?.push(obj)
            }
        }

    }

    // const results: any = []
    const noResultString = "no results"

    console.log(results)

    for (const catalogName of Object.keys(results)) {
        const resultData: any[] = results[catalogName]!



        const header = Object.keys(resultData[0]).join(',') + "\n"
        //these two maps is for making the string csv compliant.
        const rows = resultData.map(
            (row: Object) => Object.values(row).map(
                //for each element of a row
                (e: string) =>
                    e != null
                        ? "\"" + e.toString().replaceAll("\"", "'") + "\""
                        : e
            ).join(",") + "\n" // commas (,) between elements 
            // and \n character to end the row of elements
        ).join("")
        const tableInStringFormat = header + rows
        if (rows.replaceAll("\"", "").trim().toLowerCase() === noResultString.toString()) {
            cataloguesWithNoResults.value.push(catalogName)
            continue
        }
        const searchTermStringified =
            queryData.search_terms[catalogName] != null
                ? " search term: " + JSON.stringify(searchTermsToBeSent[catalogName])
                    .replaceAll("\"", "").replaceAll("{", "")
                    .replaceAll("}", "").replace(":", " eq ")
                : ""

        allCatalogueResultsInCSVs.push({
            //for some reason if name is too long, I can't open the csv???? it is not because of search term or new date it seems.
            name: catalogName + "_raw" + searchTermStringified + '.csv',
            input: Buffer.from(tableInStringFormat)
        })
    }

    isDownloading.value = false
    if (allCatalogueResultsInCSVs.length == 0) {
        showCataloguesWithNoResultsAlertDialog.value = true
        showNoResultMessage.value = true
        return
    }


    const blob = await downloadZip(
        allCatalogueResultsInCSVs as unknown as InputWithoutMeta[]
    ).blob()
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "BHCAIS " + queryData.selected_catalogues + '.zip'
    link.click()
    link.remove()

    if (cataloguesWithNoResults.value.length > 0)
        showCataloguesWithNoResultsAlertDialog.value = true
});

</script>