<style scoped>
@import '../../public/css/main-content-variants.css';
@import '../../public/css/dialog.css';

.download-report-form {
    width: 100%;
}


/* 
.dateSelector {
    width: 80% !important;
    font-size: x-large;
} */



.inner {
    margin-top: 2vh;
    background-color: rgb(253, 253, 253);
    padding: 1%;

}


.common {

    resize: horizontal;
    overflow: auto;
    max-width: 200vw !important;
}

.download-button {

    margin-top: 2vh;
}
</style>
<template>

    <div class="medium common flex  flex-start" :style="{ height: divHeight }">
        <q-form class="download-report-form" @submit.prevent="onSubmit">
            <h3>Download Reports</h3>
            <q-select v-model="selectCatelogues" v-bind="selectCataloguesProps" @clear="onCatelogueSelectClear"
                @add="onCatelogueSelectAdd" @remove="onCatelogueSelectRemove" class="select" :options="catelogueOptions"
                label="Select catalogue(s). " multiple clearable
                hint="Click on the same catalogue to unselect"></q-select>

            <div class="col inner" :style="{ height: divHeight2 }">
                <div class="row ">
                    <p class="col-8" :style="{ color: 'grey' }">Search Terms (Optional):</p>
                    <Button class="col-2 " @click.prevent="clearAllSearchTerm">clear </Button>
                    <Button class="col-2 " @click.prevent="addSearchTerm">Add </Button>
                </div>
                <div class="row " v-for="x of searchTerms">

                    <q-select v-model=x[0] class="select col" :options="filteredCatelogueFields"
                        label="Select catalogue field" @filter="filterFn" multiple clearable style="width: 250px"
                        use-input input-debounce="0">
                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey"> No results </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                    <q-input v-model=x[1] class="col" :style="{ 'margin-left': '5px' }" label="Search Term" />

                </div>

            </div>

            <div class="row">
                <!-- <q-date class="dateSelector" title="select dates (Optional)"
                    subtitle="click on two dates on the calendar to select the start and end date. " v-model="dateRange"
                    range multiple>
                    <template #default>
                        <label v-if='dateRangeProps["error"]'> You can only select one range of dates; you
                            cannnot select one or more dates or ranges {{ dateRangeProps["error-message"] }}</label>
                        <button class="button" @click.prevent="clearDates">clear dates</button>
                    </template>
</q-date> -->
            </div>
            <button class="download-button " type="submit" @click="onSubmit">
                Download</button>

        </q-form>
        <q-dialog v-model="showCataloguesWithNoResultsAlertDialog">

            <q-card class="column items-center 
            q-pb-none text-h6 dialog ">

                <q-card-section class="  items-center column q-pb-none">
                    <q-avatar icon="error" color="primary" text-color="white" class="" />
                    {{ showAllCataloguesHaveNoResultsMessage ?
                        "All catalogues do not have results."
                        : "There are no results from these catalogues: "
                        + cataloguesWithNoResults.join(",") + ". They will not be included in the zip file." }}

                    <q-btn label="Ok" color="primary" v-close-popup autofocus />
                </q-card-section>

            </q-card>

        </q-dialog>
    </div>
</template>


<script setup lang="ts">

//partial credits: https://stackblitz.com/edit/vee-validate-v4-quasar-framework?file=src%2FApp.vue
import { nextTick, ref, toRaw, type MaybeRefOrGetter, type Ref } from 'vue'
import { useForm } from 'vee-validate';

import * as yup from 'yup';
import { fetchWrapper } from '../helpers/fetch-wrapper';
import { downloadZip, type InputWithoutMeta } from 'client-zip';
import { Buffer } from 'buffer';
import { getHeaderDict } from '../constants';
const catelogueOptions = ref([
    "print", "oral_history", "negative", "slide", "library_and_archive"
])
const allCatelogueFields: Ref<string[]> = ref(["Select All"])
const filteredCatelogueFields: Ref<string[]> = ref(["Select All"])
const searchTerms = ref([["", ""]])
const cataloguesWithNoResults: Ref<string[]> = ref([])
const showCataloguesWithNoResultsAlertDialog = ref(false)
const showAllCataloguesHaveNoResultsMessage = ref(false)
const divHeight = ref("")
const divHeight2 = ref("")
const schema = yup.object().shape({
    selectCatalogues: yup.array().of(yup.string()).required("selectCatalogues is required"),
    // dateRange: yup.array().of(
    //     yup.object().shape({
    //         from: yup.date(),
    //         to: yup.date()
    //     })
    // ).nullable().max(1, "you can only have one range of dates")
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



const [selectCatelogues, selectCataloguesProps] = defineField("selectCatalogues" as MaybeRefOrGetter, quasarConfig)
selectCatelogues.value = []
// const [dateRange, dateRangeProps] = defineField("dateRange" as MaybeRefOrGetter, quasarConfig)

// function clearDates(event: any) {
// dateRange.value = []
// }

function onCatelogueSelectAdd(details: { index: number; value: string; }) {
    const currentlySelected: string[] = selectCatelogues.value!
    currentlySelected.push(details.value)
    settingNewCatalogueFieldsSelect(currentlySelected)
}
function onCatelogueSelectRemove(details: { index: number; value: string; }) {
    const currentlySelected: string[] = selectCatelogues.value!
    currentlySelected.splice(currentlySelected.indexOf(details.value), 1)
    settingNewCatalogueFieldsSelect(currentlySelected)

    for (const aSearchTerm of searchTerms.value) {
        const cats = toRaw(aSearchTerm[0]!) // not sure why this returns string[] instead of string
        const newCats = []
        if (cats.length == 0)
            continue
        for (const cat of cats!) {
            if (!cat.includes(details.value))
                newCats.push(cat)
        }
        aSearchTerm[0] = newCats.join(",")
    }
}
function settingNewCatalogueFieldsSelect(currentlySelected: string[]) {
    //setting new catalog fields
    allCatelogueFields.value = ["Select All"]
    filteredCatelogueFields.value = ["Select All"]
    for (const x of currentlySelected) {

        let key = x as keyof typeof getHeaderDict;
        const newFields = []
        for (const x of getHeaderDict[key])
            newFields.push(key + " " + x)

        allCatelogueFields.value = allCatelogueFields.value.concat(newFields)
        filteredCatelogueFields.value = filteredCatelogueFields.value.concat(newFields)
    }
    console.log("all", allCatelogueFields.value)
    console.log('filted', filteredCatelogueFields.value)

}
function onCatelogueSelectClear() {
    clearAllSearchTerm()
    allCatelogueFields.value = ["Select All"]
}
function filterFn(filterTerm: string, update: any) {
    //NOT WORKING
    if (filterTerm.length > 2) {
        update(() => {
            const new_fields = []
            for (const catelogueField of allCatelogueFields.value) {
                // console.log(catelogueField, filterTerm)
                if (catelogueField.includes(filterTerm)) {
                    new_fields.push(catelogueField)
                }
            }
            filteredCatelogueFields.value = new_fields
            nextTick()
            console.log(filterTerm)
            console.log('filtered', filteredCatelogueFields.value)

            // here you have access to "ref" which
            // is the Vue reference of the QSelect
        })
    } else {
        update(() => {

            filteredCatelogueFields.value = allCatelogueFields.value
        })
    }


}

function addSearchTerm() {
    searchTerms.value.push(["", ""])

    const heightSearchTermPanel: number = searchTerms.value.length * 5 + 5

    const overallHeight = heightSearchTermPanel + 45

    divHeight.value = (overallHeight * 0.99).toString() + "vh"
    divHeight2.value = heightSearchTermPanel.toString() + "vh"
}
function clearAllSearchTerm() {
    searchTerms.value = [["", ""]]

    divHeight.value = "50vh"
    divHeight2.value = '10vh'
}


const onSubmit = handleSubmit(async (values) => {
    const searchTermToBeSent: any = {}
    for (const cat of selectCatelogues.value) {
        searchTermToBeSent[cat] = {}
        for (const aSearchTerm of searchTerms.value) {
            if (aSearchTerm[0] == null || aSearchTerm[1] == null)
                continue
            const cat_fields = aSearchTerm[0]!.toString().split(",")
            for (const field of cat_fields) {
                const fieldWithNoCat = field.replace(cat, "").trim()
                if (field.includes(cat) && fieldWithNoCat != "" && aSearchTerm[1].trim() != "")
                    searchTermToBeSent[cat][fieldWithNoCat] = aSearchTerm[1]
            }
        }
        if (Object.keys(searchTermToBeSent[cat]).length == 0)
            delete searchTermToBeSent[cat]
    }
    const queryData = {
        selected_catalogues: [...selectCatelogues.value],
        search_terms: { ...searchTermToBeSent },
        // date_range: dateRange.value != null ? Object.values(dateRange.value[0]) : []
    }
    console.log('queryData', queryData)
    let url = `${import.meta.env.VITE_API_URL}/DownloadFiles/`
    const response = await fetchWrapper.post(url, queryData)

    const results = response.results

    const allCatalogueResultsInStringFormat = []
    // const dateRangeArray = queryData.date_range != null ? Object.values(queryData.date_range) : []
    // const dateRangeString: string = dateRangeArray.length != 0 ? "from " + dateRangeArray[0] + " to " + dateRangeArray[1] : ""

    cataloguesWithNoResults.value = []
    showAllCataloguesHaveNoResultsMessage.value = false
    for (const result of results) {
        const resultData = result.data
        if (resultData.length == 0) {
            cataloguesWithNoResults.value.push(result.catalogue_name)
            continue
        }
        const header = Object.keys(resultData[0]).join(',') + "\n"
        const rows = resultData.map((row: Object) => {
            return Object.values(row).join(',') + "\n"
        }).join("")
        const tableInStringFormat = header + rows
        const search_term_stringified = queryData.search_terms[result.catalogue_name] != null
            ? "search term: " + JSON.stringify(queryData.search_terms[result.catalogue_name]).replaceAll("\"", "")
            : ""
        allCatalogueResultsInStringFormat.push({
            name: result.catalogue_name + "_raw " + search_term_stringified
                + " Downloaded on: " + new Date() + '.csv',
            input: Buffer.from(tableInStringFormat)
        })

    }
    if (allCatalogueResultsInStringFormat.length == 0) {
        showCataloguesWithNoResultsAlertDialog.value = true
        showAllCataloguesHaveNoResultsMessage.value = true
        return
    }
    const blob = await downloadZip(allCatalogueResultsInStringFormat as unknown as InputWithoutMeta[])
        .blob()
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "BHCAIS " + queryData.selected_catalogues
        + " downloaded on " + new Date().toLocaleDateString("en-UK") + '.zip'
    link.click()
    link.remove()

    if (cataloguesWithNoResults.value.length > 0)
        showCataloguesWithNoResultsAlertDialog.value = true


});

</script>