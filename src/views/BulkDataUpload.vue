<template>
    <div>
        <Form @submit="onSubmit" v-slot="{ errors, isSubmitting }" url="">

            <div class="form-group">

                <h1>Bulk Data Upload</h1>
                <p class="instructions">Drag and drop files to here to upload or click to select multiple files here
                    Entries with existing data will be overwritten.
                    Only csv and single sheet xlsx are accepted.</p>
                <FileUpload custom-upload @select="onUploadFileSelection($event)" :multiple="true" accept=".csv,.xlsx"
                    name="file-upload" :showUploadButton="false" ref="fu">

                    <template #content="{ files, removeFileCallback }">
                        <h2>Selected files:</h2>
                        <div v-for="(file, index) of files" :key="file.name + file.type + file.size">
                            <div class="file-entry">
                                {{ file.name }} {{ file.size }} bytes <Button class="remove-btn"
                                    @click="removeFileCallback(index)">x</Button>
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <h2>Please Select file(s) before uploading</h2>
                    </template>
                </FileUpload>
                <button class="btn btn-primary">
                    <span v-show="isSubmitting" class="spinner-border 
                    spinner-border-sm mr-1"></span>
                    Upload
                </button>
            </div>
            <Dialog v-model:visible="error_dialog" modal :closable="false" class='dialog'>
                <div class="flex flex-col gap-4 dialog-div ">
                    <h2>Error </h2>
                    <p class="text-surface-500 dark:text-surface-400 text-sm mt-0 mb-0">{{ error_message }}</p>
                    <div class="flex justify-end gap-2">
                        <Button severity="secondary" @click="error_dialog = false">Ok</Button>
                    </div>
                </div>
            </Dialog>
        </Form>
    </div>
</template>
<style>
@import '../../public/css/dialog.css';

.instructions {
    margin-bottom: 5%;
}

.file-entry {
    width: 100%;
    justify-content: space-between;
}

h1 {
    text-align: center;
}



.remove-btn {
    background-color: white;
    color: black;
    width: 20px;
    height: 5px;
}

.remove-btn.hover {
    background-color: gray !important;
}
</style>
<script setup lang='ts'>
import { Form, type FormActions, type GenericObject } from 'vee-validate';
import FileUpload, { type FileUploadRemoveEvent, type FileUploadSelectEvent } from 'primevue/fileupload';
import * as xlsx from 'xlsx'
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import {slides_headers,print_headers,oral_histories_headers,negative_headers,library_and_archieve_headers} from '../constants';
import { header } from '@primeuix/themes/aura/accordion';

const error_dialog = ref(false);
const error_message = ref("");
const fu = ref();

function onSubmit(values: GenericObject, { setErrors }: FormActions<GenericObject>) {
    console.log('on submit', fu.value.files.length)
    if (fu.value.files.length == 0) {
        error_message.value = 'please select file(s) to upload'
        error_dialog.value = true
        return
    }

}


const onUploadFileSelection = (event: FileUploadSelectEvent) => {
    const names_of_files_with_headers_only: string[] = []
    const names_of_files_with_zero_bytes: string[] = []
    const names_of_files_with_incorrect_headers: string[] = []
    const x = event.files.map((file: any) => {
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
                    let tempHeadersValues: string[] = xlsx.utils.sheet_to_json(worksheet, {
                        header: 1
                    })
                    const headersTemp= tempHeadersValues[0]!
                    let headers = ""
                    console.log(file.name,headersTemp)
                    const content: string = tempHeadersValues[1]!
                    for (let x =0 ;x<headersTemp.length;x++){
                        const temp = headersTemp[x]!.toLowerCase().trim()
                        headers += x == headersTemp.length-1 ? temp : temp+"," 
                    }
                    console.log('headers',headers)
                    if (headers != slides_headers ||
                        headers != print_headers ||
                        headers != oral_histories_headers||
                        headers != negative_headers ||
                        headers != library_and_archieve_headers
                    ) {
                        fu.value.files.splice(fu.value.files.indexOf(file), 1)
                        names_of_files_with_incorrect_headers.push(file.name)
                        resolve()
                    }

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
                    let headers = csv.split('\n')[0]
                    headers = headers?.split(',').map(col => col.trim().toLowerCase()).join(',')

                    if (headers != slides_headers ||
                        headers != print_headers ||
                        headers != oral_histories_headers||
                        headers != negative_headers ||
                        headers != library_and_archieve_headers
                    ) {
                        fu.value.files.splice(fu.value.files.indexOf(file), 1)
                        names_of_files_with_incorrect_headers.push(file.name)
                        resolve()
                    }
                    console.log(`Headers from ${file.name}:\n`, headers);
                    const content = csv.split('\n').slice(1)
                    if (content.length == 1 && content[0] == "") {
                        fu.value.files.splice(fu.value.files.indexOf(file), 1)
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
            errorMessage += "These file(s) are empty: \n" + names_of_files_with_zero_bytes.join("\n") + "\n\n"
        if (names_of_files_with_incorrect_headers.length > 0)
            errorMessage += "These file(s) have incorrect or missing header columns: \n" + names_of_files_with_incorrect_headers.join('\n') + "\n\n"
        if (errorMessage != "") {
            error_message.value = errorMessage + "All of these file(s) will not be selected."
            error_dialog.value = true
        }

    })

}





</script>