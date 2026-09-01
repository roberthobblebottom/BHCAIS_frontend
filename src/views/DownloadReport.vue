<template>
    <div class="large common flex  flex-start" :style="{ height: overallDivHeight }">
        <q-form class="download-report-form" @submit.prevent="onSubmit">
            <h3>Download Reports</h3>
            <q-select v-model="selectCatalogues" v-bind="selectCataloguesProps" @clear="onCatalogueSelectClear"
                @add="onCatalogueSelectAdd" @remove="onCatalogueSelectRemove" class="select" :options="catalogueOptions"
                label="Select catalogue(s). " multiple clearable
                hint="Click on the same catalogue to unselect"></q-select>

            <div class="col inner" :style="{ height: searchTermPanelHeight }">
                <div class="row justifiy-between items-end">
                    <label class="col-7 search-terms-label">Search Terms
                        (Optional):</label>
                    <Button class="col " @click.prevent="clearAllSearchTerm"><i class="fa-solid fa-circle-xmark"></i>
                        Clear </Button>
                    <Button class="col q-ml-md" @click.prevent="addSearchTerm"><i class="fas fa-add"></i> Add </Button>
                </div>
                <div class="row " v-for="x of searchTerms">
                    <!--- Note: No more multiple selection. there are problems manpilation with this value in 3 times nested reference. also it is hard to see if you have selected multiple catalogues in one search fields--->
                    <q-select v-model=x[0] class="select col" :options="filteredCatalogueFields"
                        label="Select catalogue field" @filter="filterFn" clearable style="width: 250px" use-input
                        input-debounce="0">
                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey"> No results </q-item-section>
                            </q-item>
                        </template>
                        <q-tooltip v-if="x[0]"> {{ (x[0])?.toString() }} </q-tooltip>
                    </q-select>
                    <q-input v-model=x[1] class="col" :style="{ 'margin-left': '5px' }" label="Search Term" />
                </div>
            </div>
            <button class="download-button " type="submit" @click="onSubmit"><i class="fas fa-file-arrow-down"></i>
                Download</button>
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

                <q-btn label="Ok" color="primary" v-close-popup autofocus />
            </q-card>
        </q-dialog>
    </div>
</template>
<style scoped>
@import '../../public/css/main-content-variants.css';
@import '../../public/css/dialog.css';

.download-report-form {
    width: 100%;
}

.inner {
    margin-top: 2vh;
    background-color: rgb(253, 253, 253);
}


.common {
    resize: horizontal;
    overflow: auto;
    max-width: 200vw !important;
}

.download-button {
    margin-top: 2vh;
    width: 26%;
    float: right;
}

.large {
    min-height: 20vh;
}

.search-terms-label {
    color: grey !important;
    font-size: 16px;
}
</style>

<script setup lang="ts">

//partial credits: https://stackblitz.com/edit/vee-validate-v4-quasar-framework?file=src%2FApp.vue
import { ref, toRaw, type MaybeRefOrGetter, type Ref } from 'vue'
import { useForm } from 'vee-validate';

import * as yup from 'yup';
import { fetchWrapper, stream } from '../helpers/fetch-wrapper';
import { downloadZip, type InputWithoutMeta } from 'client-zip';
import { Buffer } from 'buffer';
import { catalogueNames, getHeaderDict } from '../constants';

const catalogueOptions = ref(catalogueNames)
const allCatalogueFields: Ref<string[]> = ref(["Select All"])
const filteredCatalogueFields: Ref<string[]> = ref(["Select All"])
const searchTerms = ref([["", ""]]) // for list of select catalogue field and written search term pairs

//for catalogues with no results:
const cataloguesWithNoResults: Ref<string[]> = ref([])
const showCataloguesWithNoResultsAlertDialog = ref(false)
const showNoResultMessage = ref(false)

//styling
const overallDivHeight = ref("")
const searchTermPanelHeight = ref("")

//field validation
const schema = yup.object().shape({
    selectCatalogues: yup.array().of(yup.string()).required("selectCatalogues is required"),

});
const { defineField, handleSubmit } = useForm({
    validationSchema: schema,
    initialValues: {
        terms: false,
    },
});
const quasarConfig = (state: any) => ({
    props: {
        error: !!state.errors[0],
        'error-message': state.errors[0],
    },
});
const [selectCatalogues, selectCataloguesProps] = defineField("selectCatalogues" as MaybeRefOrGetter, quasarConfig)
selectCatalogues.value = []

function onCatalogueSelectAdd(details: { index: number; value: string; }) {
    const currentlySelected: string[] = selectCatalogues.value!
    currentlySelected.push(details.value)
    setCatalogueFieldOptionsForSomeSelectUIs(currentlySelected)
}
function onCatalogueSelectRemove(details: { index: number; value: string; }) {
    const currentlySelected: string[] = selectCatalogues.value!
    currentlySelected.splice(currentlySelected.indexOf(details.value), 1)
    setCatalogueFieldOptionsForSomeSelectUIs(currentlySelected)
    for (let aSearchTerm of searchTerms.value) {
        const cats = toRaw(aSearchTerm[0]!)
        if (cats.length == 0)
            continue
        if (cats.includes(details.value))
            searchTerms.value.splice(searchTerms.value.indexOf(aSearchTerm), 1)
        if (searchTerms.value.length == 0)
            searchTerms.value = [["", ""]]
    }
}
function setCatalogueFieldOptionsForSomeSelectUIs(currentlySelected: string[]) {
    //setting new catalog fields
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
function filterFn(filterTerm: string, update: any) {
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
    searchTerms.value.push(["", ""])

    //5 is for the space for the headers and add/clear button
    const heightSearchTermPanel: number = searchTerms.value.length * 3.5 + 5
    //20 for the remaining height of the main content in .large div
    const overallHeight = heightSearchTermPanel + 20
    overallDivHeight.value = overallHeight.toString() + "vh"
    searchTermPanelHeight.value = heightSearchTermPanel.toString() + "vh"
}
function clearAllSearchTerm() {
    searchTerms.value = [["", ""]]
    overallDivHeight.value = "27vh"
    searchTermPanelHeight.value = '7vh'
}


const onSubmit = handleSubmit(async (_values) => {
    const searchTermToBeSent: any = {}
    for (const cat of selectCatalogues.value) {
        searchTermToBeSent[cat] = {}
        for (const catalogueFieldAndSearchTermPair of searchTerms.value) {
            if (catalogueFieldAndSearchTermPair[0] == null
                || catalogueFieldAndSearchTermPair[1] == null)
                continue
            const fieldsWithCatPrefix = catalogueFieldAndSearchTermPair[0]!.toString().split(",")
            for (const fieldWithCatPrefix of fieldsWithCatPrefix) {
                const field = fieldWithCatPrefix.replace(cat, "").trim()
                if (fieldWithCatPrefix.includes(cat) && field != ""
                    && (catalogueFieldAndSearchTermPair[1] as String).trim() != "")
                    searchTermToBeSent[cat][field] = catalogueFieldAndSearchTermPair[1]
            }
        }
        if (Object.keys(searchTermToBeSent[cat]).length == 0)
            delete searchTermToBeSent[cat]
    }
    const queryData = {
        selected_catalogues: [...selectCatalogues.value],
        search_terms: { ...searchTermToBeSent },
    }
    let url = `${import.meta.env.VITE_API_URL}/DownloadFiles/`
    const response = await stream(url, queryData)
    // const results = response.results
    const allCatalogueResultsInCSVs = []
    cataloguesWithNoResults.value = []
    showNoResultMessage.value = false
    let reader = null
    try {
        reader = response.body!.getReader()
    }
    catch (err) { console.error(err) }
    let isReadDone = false;
    const textDecoder = new TextDecoder()
    let text = ""

    while (!isReadDone) {
        let { value, done } = await reader!.read();
        isReadDone = done
        if (isReadDone)
            break
        text += textDecoder.decode(value)
        // const text = textDecoder.decode(value)
    }
    const results: any = []
    for (const x of text.split("catalogue_name").slice(1)) {
        const returnedCat = x.slice(1, x.indexOf("{"))//"{" is the start of the rows so I don't need that stuff for catalogue name
        //slice the first and the last characters. "{" and "}"
        const rows = x.slice(x.indexOf("{")).slice(0, x.length - 1).split("},{")
        const newRows = []
        for (let x of rows) {
            x = x.at(0) == "{" ? x + "}" : "{" + x + "}"
            x = x.replace("},}", "}")
            newRows.push(JSON.parse(x))
        }
        const o: any = {
            catalogue_name: returnedCat,
            data: newRows
        }
        results.push(o)
    }
    for (const catalog of results) {
        const resultData = catalog.data

        if (resultData.length == 0) {
            cataloguesWithNoResults.value.push(catalog.catalogue_name)
            continue
        }

        const header = Object.keys(resultData[0]).join(',') + "\n"
        const rows = resultData.map((row: Object) => Object.values(row).join(',') + "\n"
        ).join("")
        const tableInStringFormat = header + rows

        const searchTermStringified = queryData.search_terms[catalog.catalogue_name] != null
            ? "search term: " + JSON.stringify(searchTermToBeSent[catalog.catalogue_name])
                .replaceAll("\"", "").replaceAll("{", "").replaceAll("}", "").replace(":", " eq ")
            : ""

        allCatalogueResultsInCSVs.push({
            //for some reason if name is too long, I can't open the csv???? it is not because of search term or new date it seems.
            name: catalog.catalogue_name + "_raw " + searchTermStringified + '.csv',
            // name: catalog.catalogue_name + "_raw " + " Downloaded on: " + new Date().toLocaleDateString("en-UK").replaceAll("/", "") + '.csv',
            input: Buffer.from(tableInStringFormat)
        })
    }

    if (allCatalogueResultsInCSVs.length == 0) {
        showCataloguesWithNoResultsAlertDialog.value = true
        showNoResultMessage.value = true
        return
    }

    const blob = await downloadZip(
        allCatalogueResultsInCSVs as unknown as InputWithoutMeta[])
        .blob()
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "BHCAIS " + queryData.selected_catalogues + '.zip'
    link.click()
    link.remove()

    if (cataloguesWithNoResults.value.length > 0)
        showCataloguesWithNoResultsAlertDialog.value = true
});

</script>