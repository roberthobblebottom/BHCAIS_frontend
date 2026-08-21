<script setup lang="ts">

//credits: https://stackblitz.com/edit/vee-validate-v4-quasar-framework?file=src%2FApp.vue
import { ref, type MaybeRefOrGetter, type Ref } from 'vue'

import { useForm } from 'vee-validate';

import * as yup from 'yup';
import { fetchWrapper } from '../helpers/fetch-wrapper';
import { downloadZip, type InputWithMeta, type InputWithoutMeta, type StreamLike } from 'client-zip';
import { Buffer } from 'buffer';

const searchTerm = ref('')
const options = ref([
    "print", "oral_history", "negative", "library_and_archive", "slide"
])

const cataloguesWithNoResults: Ref<string[]> = ref([])
const showCataloguesWithNoResultsAlertDialog = ref(false)
const showAllCataloguesHaveNoResultsMessage = ref(false)
const schema = yup.object().shape({
    selectCatalogues: yup.array().of(yup.string()).required("selectCatalogues is required"),
    dateRange: yup.array().of(
        yup.object().shape({
            from: yup.date(),
            to: yup.date()
        })
    ).nullable().max(1, "you can only have one range of dates")
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
// const [dateRange, dateRangeProps] = defineField("dateRange" as MaybeRefOrGetter, quasarConfig)

function clearDates(event: any) {
    // console.log(dateRange.value)
    // dateRange.value = []
}

const onSubmit = handleSubmit(async (values) => {
    const queryData = {
        selected_catalogues: [...selectCatalogues.value],
        search_term: searchTerm.value,
        // date_range: dateRange.value != null ? Object.values(dateRange.value[0]) : []
    }
    let url = `${import.meta.env.VITE_API_URL}/downloadFiles/`
    const response = await fetchWrapper.post(url, queryData)
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

        allCatalogueResultsInStringFormat.push({
            name: result.catalogue_name + "_raw" + searchTerm2
                + " downloaded on " + new Date() + '.csv',
            input: Buffer.from('data:text/csv;charset=utf-8,' + encodeURIComponent(tableInStringFormat))
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

    <div class="q-pa-md small common ">
        <q-form class="download-report-form" @submit.prevent="onSubmit">
            <h3>Download Reports</h3>
            <q-select v-model="selectCatalogues" v-bind="selectCataloguesProps" class="select" :options="options"
                hint="Select catalogue(s). Click on the same catalogue to unselect" multiple></q-select>
            <q-input v-model="searchTerm" label="Search Term (Optional)" />
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