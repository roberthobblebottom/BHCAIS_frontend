<template>
    <div class=" common medium  ">
        <q-form validation-observer @submit.prevent="onSubmit">
            <h3>Download Reports</h3>

            <q-select v-model="selectCatalogues" class="select" :option-label="format1"
                hint="Click on the same catalogue to unselect" label="Select catalogue(s)" multiple clearable
                :options="catalogueOptions" :error-message="errorMessage" :error="errorMessage != ''"
                @add="onCatalogueSelectAdd" @remove="onCatalogueSelectRemove"
                @clear="onCatalogueSelectClear"></q-select>

            <!-- inner div for one or more search term -->
            <div class="col q-mt-md">
                <div class="row justifiy-between items-end">
                    <label class="col-6 search-terms-label text-subtitle1">Search Terms (Optional):</label>
                    <div class="col flex justify-end">
                        <q-btn color="red" size="md" class="" @click.prevent="resetSearchTermsToOnePair">
                            <q-icon name="fa-regular fa-x" class="q-mr-sm" size="sm"></q-icon>
                            Clear </q-btn>
                        <q-btn color="blue" size="md" class="q-ml-md " @click.prevent="addSearchTerm">
                            <q-icon name="fas fa-add" class="q-mr-sm" size="sm"></q-icon>
                            Add </q-btn>

                    </div>
                </div>

                <div class=" row items-end" v-for="(x, index) of selectedSearchTerms">
                    <!--- Note: No more multiple selection. 
                    there are problems manpilation with this value in 3 times nested reference. 
                    also it is hard to see if you have selected multiple catalogues in one search fields--->
                    <div class="">
                        <div class="select-catalogue-name">
                            <label v-if="x[0] !== null">
                                {{ format1(formatFields(x[0]!)[0]!, false) }}
                            </label>
                        </div>
                        <q-select v-model=x[0] class="select2 " :options="filteredCatalogueFields"
                            @filter="filterFunction" clearable style="width: 250px" use-input input-debounce="0"
                            emit-value>
                            <template #no-option>
                                <q-item>
                                    <q-item-section class="text-grey"> No results </q-item-section>
                                </q-item>
                            </template>
                            <template #selected=>
                                <q-item class="selected-item" v-if="x[0] !== null">
                                    <q-item-section>
                                        <q-item-label>
                                            {{ format1(formatFields(x[0]!)[1]!, false) }}
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-item class="selected-item" v-else></q-item>

                            </template>
                            <template #option="{ opt, itemProps }">
                                <q-item class="flex column" v-bind="itemProps" v-if="opt.value !== undefined">
                                    <q-item-section class="row option-catalogue">
                                        {{
                                            format1(opt.catalogueName)
                                        }}
                                    </q-item-section>
                                    <q-item-section class="row">
                                        <q-item-label class="option-catalogue-field">
                                            {{ format1(opt.label, false) }}
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-item v-else></q-item>

                            </template>
                        </q-select>

                    </div>
                    <q-input v-model=x[1] class="col" :style="{ 'margin-left': '5px', 'padding-bottom': '0px' }"
                        label="Enter Search Term" :error="x[0]?.includes('sn') ? snError[index] : false"
                        :error-message="x[0]?.includes('sn') ? snErrorMessage[index] : ''"
                        @update:model-value="x[0]?.includes('sn') ? snValidation(x[1]!, index) : ''" />
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

                <label class="q-mt-md"> {{ showNoResultMessage
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

.search-terms-label {
    color: grey !important;
}

.select2 {
    width: 4vw;
    max-width: 25vw;
}

.option-catalogue-field {
    margin-left: -3.5%;
}

.option-catalogue-name {
    font-size: x-small;
}

.selected-item {
    margin-left: -8.5%;
    overflow-x: hidden;
}

.select-catalogue-name {
    margin-bottom: -7%;
    font-size: x-small;
}
</style>

<script setup lang="ts">
//partial credits: https://stackblitz.com/edit/vee-validate-v4-quasar-framework?file=src%2FApp.vue
import { nextTick, ref, toRaw, type MaybeRefOrGetter, type Ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { streamFilesDownload } from '../helpers/fetch-wrapper'
import { downloadZip, type InputWithoutMeta } from 'client-zip'
import { Buffer } from 'buffer'
import { catalogueNames, getFieldNames } from '../constants'
import { useAuthStore } from '../stores/auth.store'
import { format1 } from '../helpers/otherHelperFunctions'


const catalogueOptions = ref(catalogueNames)

/**
 * All Catalogue Fields to be displayed in the search term q select component(s)
 */
const allCatalogueFields: Ref<any[]> = ref([""])
const filteredCatalogueFields: Ref<string[]> = ref([""])

// for list of select catalogue field and written search term pairs
const selectedSearchTerms: Ref<any[]> = ref([[null, null]])

/**
 * I don't know what is this about:
 */
const errorMessage = ref("")

const isDownloading = ref(false)

/**
 * for catalogues with no results:
 * */
const cataloguesWithNoResults: Ref<string[]> = ref([])
const showCataloguesWithNoResultsAlertDialog = ref(false)
const showNoResultMessage = ref(false)

/**
 * For the SN Errors:
 */
const snError = ref([false])
const snErrorMessage = ref([''])

//field validation
const schema = yup.object().shape({
    selectCatalogues: yup.array()
        .of(yup.string()
            .oneOf(catalogueNames, 'Invalid Catalogue'))
        .required("Selection of catalogues is required"),
})

const { defineField, handleSubmit } = useForm({
    validationSchema: schema,
    initialValues: { selectCatalogues: [] },
})

const quasarConfig = (state: any) => ({
    props: {
        error: !!state.errors[0],
        'error-message': state.errors[0],
    },
})

const [selectCatalogues, selectCataloguesProps] = defineField("selectCatalogues" as MaybeRefOrGetter, quasarConfig)


function formatFields(value: string | null) {
    /**
     * Format Fields to display them better in the drop down list.
     */
    if (value === null)
        return ''
    const splitValue = value === "" ? ["", ""] : value.trim().split(" ")
    const catalogueName = splitValue[0]
    const fieldName = splitValue[1]
    return catalogueName == "" ? '' : [catalogueName, fieldName]
}



function onCatalogueSelectAdd(details: { index: number, value: string }) {
    /**
     * On adding selected catalogue, set the fields in the search terms accordingly
     */
    const currentlySelected: string[] = selectCatalogues.value!
    currentlySelected.push(details.value)
    setCatalogueFieldOptionsForSearchTermQSelectUIs(currentlySelected)
}

function onCatalogueSelectRemove(details: { index: number, value: string }) {
    /**
      *  On removing selected catalogue, 
      *  set the fields in the search terms accordingly
      */
    const currentlySelected: string[] = selectCatalogues.value!
    currentlySelected.splice(currentlySelected.indexOf(details.value), 1)
    setCatalogueFieldOptionsForSearchTermQSelectUIs(currentlySelected)

    /**remove already selected search terms accordingly,
    * if the catalogues they are from are unselected.    
    */
    for (let aSearchTerm of selectedSearchTerms.value) {
        const cats = toRaw(aSearchTerm[0]!)
        if (cats.length == 0)
            continue
        if (cats.includes(details.value))
            selectedSearchTerms.value.splice(selectedSearchTerms.value.indexOf(aSearchTerm), 1)
        if (selectedSearchTerms.value.length == 0)
            selectedSearchTerms.value = [[null, null]]
    }
}

function setCatalogueFieldOptionsForSearchTermQSelectUIs(currentlySelected: string[]) {
    /**
     * Set catalogue fields for the q-select of search terms
     */
    allCatalogueFields.value = []
    filteredCatalogueFields.value = []
    for (const x of currentlySelected) {
        let key = x as keyof typeof getFieldNames // for using string as keys for the object
        const newFields = []
        for (const x1 of getFieldNames[key])
            newFields.push({
                catalogueName: key.toString(),
                label: x1,
                value: key.toString() + " " + x1
            })
        // newFields.push(key + " Select All") // removed select all option
        allCatalogueFields.value = allCatalogueFields.value.concat(newFields)
        filteredCatalogueFields.value = allCatalogueFields.value
    }
}

function onCatalogueSelectClear() {
    /**
     * Clears all fieldss in the search terms. 
     * And reset search terms back to only one pair.
     */
    resetSearchTermsToOnePair()
    allCatalogueFields.value = []
    selectCatalogues.value = []
}

function resetSearchTermsToOnePair() { selectedSearchTerms.value = [[null, null]] }

function filterFunction(filterTerm: string, update: any) {
    /**
     * When typing in the input field of the q-select
     * Set filteredCatalogueFields reference value accordingly to whether filterTerm
     * exists in substring of any catalogue fields.
     * 
     * Requires minimun of two characters in filterTerm
     */
    if (filterTerm.length > 2)
        update(() => {
            const new_fields = []
            for (const catalogueField of allCatalogueFields.value) {
                if (catalogueField.value.toLowerCase().includes(filterTerm.toLowerCase().trim()))
                    new_fields.push(catalogueField)
            }
            filteredCatalogueFields.value = new_fields
        })
    else
        update(() => filteredCatalogueFields.value = allCatalogueFields.value)
}

function addSearchTerm() { selectedSearchTerms.value.push([null, null]) }

function snValidation(value: string, iteration: number) {
    /**
     * Validate sn values so that only numbers ,commas  
     * and spaces are allowed 
     */
    const regex = new RegExp('^[0-9, ]+$')

    if (!regex.test(value) && value != "") {
        snError.value[iteration] = true
        snErrorMessage.value[iteration] = 'Invalid value, only spaces, commas or numbers allow in sn selection.'
    }
    else {
        snError.value[iteration] = false
        snErrorMessage.value[iteration] = ''
    }
}


const onSubmit = handleSubmit(async (_values) => {
    /**
     *  Submit catalogues choosen and search terms in form to download 
     *  such reports
     */

    // if guards to prevent errornous forms
    for (const err of snError.value)
        if (err == true)
            return
    if (selectCatalogues.value.length == 0) {
        selectCataloguesProps.value['error'] = true
        selectCataloguesProps.value['error-message'] = "Please select a catalogue(s)."
        errorMessage.value = "Please Select a catalogue."
        nextTick()
        return
    }

    //setting up search terms to be sent 
    // cat = catalogue
    const searchTermsToBeSent: any = {}
    for (const cat of selectCatalogues.value) {
        searchTermsToBeSent[cat] = {}
        for (const catFieldAndSearchTermPair of selectedSearchTerms.value) {
            if (catFieldAndSearchTermPair[0] == null
                || catFieldAndSearchTermPair[1] == null)
                continue

            const fieldsWithCatPrefix = catFieldAndSearchTermPair[0]!
                .toString()
                .split(",")
            for (const fieldWithCatPrefix of fieldsWithCatPrefix) {
                const field = fieldWithCatPrefix.replace(cat, "").trim()

                //only add search term if the pair are not empty  
                if ((fieldWithCatPrefix.includes(cat) && field != "")
                    && (catFieldAndSearchTermPair[1] as String).trim() != "") {

                    let count = 0
                    for (const x of Object.keys(searchTermsToBeSent[cat]))
                        count += x.includes(field) ? 1 : 0
                    searchTermsToBeSent[cat][field + "__" + count.toString()] =
                        catFieldAndSearchTermPair[1]
                }
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

    // reading the chunks streamed
    let reader = null
    let isReadDone = false
    const textDecoder = new TextDecoder()
    let results: { [index: string]: any[] } = {}
    let currentCatalogue = ""
    let buffer = ""

    reader = await streamFilesDownload(url, queryData)

    while (!isReadDone) {
        let { value: encodedValue, done } = await reader!.read()
        isReadDone = done
        if (isReadDone)
            break
        const decodedValue = textDecoder.decode(encodedValue)

        for (let lineString of decodedValue.split('\n')) {
            if (lineString == "")
                continue
            if (buffer != "")
                lineString = buffer + lineString

            try {
                const obj = JSON.parse(lineString)
                if (Object.keys(obj)[0] == 'catalogue_name') {
                    currentCatalogue = Object.values(obj)[0] as string
                    results[currentCatalogue] = []
                } else {
                    if (currentCatalogue == "")
                        throw new Error("currentCatalogue is a empty string. it should be populated")
                    results[currentCatalogue]?.push(obj)
                }
                buffer = ""
            } catch (SyntaxError) {
                buffer += lineString
                continue
            }
        }
    }

    const noResultString = "no results"

    //Format the data of each catalogue to be of CSV compliant
    for (const catalogName of Object.keys(results)) {
        const resultData: any[] = results[catalogName]!

        const header = Object.keys(resultData[0])
            .map(c => format1(c, false))
            .join(',')
            + "\n"

        const rows = resultData.map(
            (row: Object) => Object.values(row).map(
                (e: string) =>
                    e != null
                        ? "\"" + e.toString().replaceAll("\"", "'") + "\""
                        : e
            ).join(",") + "\n" // commas (,) between elements 
            // and \n character to end the row of elements
        ).join("")

        const tableInStringFormat = header + rows

        if (rows.replaceAll("\"", "").trim().toLowerCase()
            === noResultString.toString()) {
            cataloguesWithNoResults.value.push(catalogName)
            continue
        }

        const searchTermStringified =
            queryData.search_terms[catalogName] != null
                ? " search term: "
                + JSON.stringify(searchTermsToBeSent[catalogName])
                    .replaceAll("\"", "").replaceAll("{", "")
                    .replaceAll("}", "").replace(":", " LIKE ")
                : ""

        allCatalogueResultsInCSVs.push({
            // for some reason if name is too long, 
            // I can't open the csv???? 
            // it is not because of search term or new date it seems.
            name: format1(catalogName, false) + " raw" + searchTermStringified + '.csv',
            input: Buffer.from(tableInStringFormat)
        })
    }

    // show all catalogues have no results dialog
    isDownloading.value = false
    if (allCatalogueResultsInCSVs.length == 0) {
        showCataloguesWithNoResultsAlertDialog.value = true
        showNoResultMessage.value = true
        return
    }


    const blob = await downloadZip(
        allCatalogueResultsInCSVs as unknown as InputWithoutMeta[]
    ).blob()

    // Download Complete UI 
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "BHCAIS " + queryData.selected_catalogues.map(c => format1(c, false)) + '.zip'
    link.click()
    link.remove()

    // show some catalogues have no results dialog
    if (cataloguesWithNoResults.value.length > 0)
        showCataloguesWithNoResultsAlertDialog.value = true
})

</script>