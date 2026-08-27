<style scoped>
@import '../../public/css/main-content-variants.css';
@import '../../public/css/dialog.css';

.download-report-form {
    display: grid;
    row-gap: 5% !important;
}

.row {
    display: flex;
    justify-content: space-evenly;
}

.d1 {
    width: 30% !important;
    border-radius: 15px !important;
    font-size: medium !important;
}

.dateSelector {
    width: 80% !important;
    font-size: x-large;
}
</style>
<template>

    <div class="q-pa-md medium common ">
        <q-form class="download-report-form" @submit.prevent="onSubmit">
            <h3>Download Reports</h3>
            <q-select v-model="selectCatelogues" v-bind="selectCataloguesProps" @clear="onCatelogueSelectClear"
                @add="onCatelogueSelectAdd" @remove="onCatelogueSelectRemove" class="select" :options="catelogueOptions"
                label="Select catalogue(s). Click on the same catalogue to unselect" multiple clearable></q-select>
            <!-- <q-input v-model="searchTerm1" label="Search Term (Optional)" /> -->
            <div class="column">
                <p>Search Terms (Optional):</p>
                <div class="row" v-for="x of searchTerms">

                    <q-select v-model=x[0] class="select" :options="catalogueFields" label="Select catalogue field"
                        @filter="filterFn" multiple clearable style="width: 250px" use-input input-debounce="0">
                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey"> No results </q-item-section>
                            </q-item>
                        </template>
                    </q-select>

                    <q-input v-model=x[1] label="Search Term" />

                </div>
            </div>
            <div class="row flex justify-evenly">

                <Button class="col" @click.prevent="clearAllSearchTerm">clear search terms</Button>
                <Button class="col" @click.prevent="addSearchTerm">Add search term</Button>

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
            <button class="button" type="submit" @click="onSubmit">
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
const catalogueFields: Ref<string[]> = ref(["Select All"])
const searchTerms = ref([["", ""]])
const cataloguesWithNoResults: Ref<string[]> = ref([])
const showCataloguesWithNoResultsAlertDialog = ref(false)
const showAllCataloguesHaveNoResultsMessage = ref(false)
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
    catalogueFields.value = ["Select All"]
    for (const x of currentlySelected) {

        let key = x as keyof typeof getHeaderDict;
        const newFields = []
        for (const x of getHeaderDict[key])
            newFields.push(key + " " + x)

        catalogueFields.value = catalogueFields.value.concat(newFields)
    }


}
function onCatelogueSelectClear() {
    clearAllSearchTerm()
    catalogueFields.value = ["Select All"]
}
function filterFn(val: string, update: any) {
    //NOT WORKING
    if (val === '') {
        update(() => {
            const new_fields = []
            for (const x of catalogueFields.value) {
                if (x.includes(val)) {
                    new_fields.push(x)
                }
            }
            console.log(new_fields)
            catalogueFields.value = new_fields

            // here you have access to "ref" which
            // is the Vue reference of the QSelect
        })
        return
    }


}

function addSearchTerm() {
    searchTerms.value.push(["", ""])

}
function clearAllSearchTerm() {
    searchTerms.value = [["", ""]]
}


const onSubmit = handleSubmit(async (values) => {
    console.log("SELECTED CATELOGUES", selectCatelogues.value)
    const searchTermToBeSent: any = {}
    for (const aSearchTerm of searchTerms.value) {
        if (aSearchTerm[0] == '' || aSearchTerm[1] == '')
            continue

        const cat_fields = aSearchTerm[0]!.toString().split(",")
        for (const field of cat_fields)
            searchTermToBeSent[field] = aSearchTerm[1]
    }

    const queryData = {
        selected_catalogues: [...selectCatelogues.value],
        search_terms: { ...searchTermToBeSent },
        // date_range: dateRange.value != null ? Object.values(dateRange.value[0]) : []
    }
    console.log('queryData', queryData)
    return
    let url = `${import.meta.env.VITE_API_URL}/DownloadFiles/`
    const response = await fetchWrapper.post(url, queryData)

    return
    const results = response.results

    const allCatalogueResultsInStringFormat = []
    const searchTerm2 = queryData.search_term == "" ? "" : " search term: " + queryData.search_term
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
        console.log('tableInStringFormat', tableInStringFormat)
        allCatalogueResultsInStringFormat.push({
            name: result.catalogue_name + "_raw" + searchTerm2
                + " downloaded on " + new Date() + '.csv',
            input: Buffer.from(tableInStringFormat)
        })

    }
    if (allCatalogueResultsInStringFormat.length == 0) {
        showCataloguesWithNoResultsAlertDialog.value = true
        showAllCataloguesHaveNoResultsMessage.value = true
        return
    }
    const blob = await downloadZip(allCatalogueResultsInStringFormat as unknown as InputWithoutMeta[]).blob()
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "BHCAIS" + searchTerm2
        + " downloaded on " + new Date().toLocaleDateString("en-UK") + '.zip'
    link.click()
    link.remove()

    if (cataloguesWithNoResults.value.length > 0) {
        showCataloguesWithNoResultsAlertDialog.value = true
    }

});

</script>