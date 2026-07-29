<template>

    <form @submit="submit">
        <h3>Bulk Data Upload</h3>
        <p>Entries with existing data will be overwritten.
            Only csv and single sheet xlsx are accepted.</p>
        <q-uploader class="fu" :multiple="true" persistent accept=".csv,.xlsx" label="Drag and drop file(s) here to upload or click to select file(s) here
            " @added="onAddedListener" ref="fu" :url="url_" field-name="files" method="POST"
            @uploaded="onUploadedListener" @failed="onFailedListener" />
        <!-- <button type="submit">Upload</button> -->
    </form>

    <div>
        <q-dialog v-model="dialog" persistent backdrop-filter="blur(4px)">
            <q-card-section class="row items-center q-pb-none text-h6 dialog ">
                <h3>{{ dialog_header }}</h3>
                <p>{{ dialog_message }}
                </p>
                <q-btn label="Ok" color="primary" v-close-popup />
            </q-card-section>

        </q-dialog>
    </div>
</template>
<style>
@import '../../public/css/dialog.css';

.instructions {
    margin-bottom: 5%;
}

h1 {
    text-align: center;
}

.fu {
    width: 500px !important;
}
</style>
<script setup lang='ts'>
import * as xlsx from 'xlsx'
import { ref } from 'vue';
import { QUploader } from 'quasar';
import { library_and_archives_header, negative_headers, oral_histories_headers, print_headers, slides_headers } from '../constants';
const dialog_header = ref("")
const dialog_message = ref("");
const fu = ref();
const dialog = ref(false)
const url_ = ref(`${import.meta.env.VITE_API_URL}/uploadFiles`);

const onAddedListener = (files: readonly File[]) => {
    const names_of_files_with_headers_only: string[] = []
    const names_of_files_with_zero_bytes: string[] = []
    const names_of_files_with_incorrect_headers: string[] = []
    const x = files.map((file: any) => {
        return new Promise<void>((resolve) => {
            if (file.size == 0) {
                names_of_files_with_zero_bytes.push(file.name)
                fu.value.files.splice(fu.value.files.indexOf(file), 1)
                resolve()
            }
            const reader = new FileReader()
            if (file.name.includes('.xlsx')) {
                reader.onload = (e: ProgressEvent<FileReader>) => {

                    // Read the file as an array buffer
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);

                    const workbook = xlsx.read(data, { type: 'array', sheetRows: 2 });
                    const sheetName = workbook.SheetNames[0]!;
                    const worksheet: any = workbook.Sheets[sheetName];

                    // Extract headers (first row)
                    let tempHeadersValues: any[] = xlsx.utils.sheet_to_json(worksheet, {
                        header: 1
                    })
                    const headers: Object = tempHeadersValues[0]!
                    const content: string = tempHeadersValues[1]!
                    const headersString: string = Object.values(headers).map(col => col.trim().toLocaleLowerCase()).toString()
                    if (headersString != print_headers
                        && headersString != negative_headers
                        && headersString != slides_headers
                        && headersString != library_and_archives_header
                        && headersString != oral_histories_headers
                    ) {
                        fu.value.files.splice(fu.value.files.indexOf(file), 1)
                        names_of_files_with_incorrect_headers.push(file.name)
                    }
                    // console.log("headers", headersString)
                    if (content == null) {
                        // names_of_headers_only_files.push(file.name)
                        fu.value.files.splice(fu.value.files.indexOf(file), 1)
                        names_of_files_with_headers_only.push(file.name)
                    }

                    resolve()

                }
                reader.readAsArrayBuffer(file)
            }
            else if (file.name.includes('.csv')) {
                reader.onload = (e: ProgressEvent<FileReader>) => {

                    const csv = e.target?.result as string
                    let headersString = csv.split('\n')[0]?.split(",")
                        .map(col => col.trim().toLocaleLowerCase()).toString()
                    if (headersString != print_headers
                        && headersString != negative_headers
                        && headersString != slides_headers
                        && headersString != library_and_archives_header
                        && headersString != oral_histories_headers
                    ) {
                        fu.value.files.splice(fu.value.files.indexOf(file), 1)
                        names_of_files_with_incorrect_headers.push(file.name)
                    }
                    // console.log(`Headers from ${file.name}:\n`, headers);
                    const content = csv.split('\n').slice(1)
                    if (content.length == 1 && content[0] == "") {
                        fu.value.removeFile(file)
                        names_of_files_with_headers_only.push(file.name)

                    }

                    resolve()
                }
                reader.readAsText(file)
            }
        })

    })


    Promise.all(x).then(() => {
        let errorMessage = ''
        if (names_of_files_with_headers_only.length > 0)
            errorMessage += "These file(s) only have headers: \n" + names_of_files_with_headers_only.join("\n") + "\n\n"
        if (names_of_files_with_zero_bytes.length > 0)
            errorMessage += "These file(s) is empty: \n" + names_of_files_with_zero_bytes.join("\n") + "\n\n"
        if (names_of_files_with_incorrect_headers.length > 0)
            errorMessage += "These file(s) have incorrect (or missing) headers: \n" + names_of_files_with_incorrect_headers.join("\n") + "\n\n"
        if (errorMessage != "") {
            dialog_header.value = "Error"
            dialog_message.value = errorMessage + "All of these file(s) will not be selected."
            dialog.value = true
        }

    })

}
const onUploadedListener = (info: { files: readonly any[]; xhr: XMLHttpRequest; }) => {
    dialog_header.value = "Successful"
    dialog_message.value = "sucessfully uploaded file(s)"
    dialog.value = true
    fu.value.reset()
}

const onFailedListener = (info: { files: readonly any[]; xhr: XMLHttpRequest; }) => {
    if (info.xhr.status == 0)
        return
    dialog_header.value = "Error: Upload Failed"
    dialog_message.value = info.xhr.response.toString()
    dialog.value = true
}
const submit = () => {
    // event.preventDefault()
}
</script>