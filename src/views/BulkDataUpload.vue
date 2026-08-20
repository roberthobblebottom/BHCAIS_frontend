<template>
    <div class="medium common">
        <form @submit="submit">
            <h3>Bulk Data Upload</h3>
            <p>Entries with existing data will be overwritten.
                Only csv and single sheet xlsx are accepted.</p>
            <q-uploader class="fu " :multiple="true" persistent accept=".csv,.xlsx" @added="onAddedListener"
                ref="fileUploaderRef" :url="url_" field-name="files" method="POST" @uploaded="onUploadedListener"
                @failed="onFailedListener" :form-fields="formFields" color="grey-9">
                <template v-slot:header="scope">
                    <div class="row no-wrap items-center q-pa-sm q-gutter-xs ">
                        <q-btn class="q-mr-md" v-if="scope.queuedFiles.length > 0" icon="clear_all"
                            @click="scope.removeQueuedFiles" round dense flat>
                            Clear All
                        </q-btn>
                        <q-btn v-if="scope.uploadedFiles.length > 0" icon="done_all" @click="scope.removeUploadedFiles"
                            round dense flat>
                            <q-tooltip>Remove Uploaded Files</q-tooltip>
                        </q-btn>
                        <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
                        <div class="col ">
                            <div class="q-uploader__title">Drag and drop file(s) or click Pick Files(s)
                                here</div>
                            <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }} /
                                {{ scope.uploadProgressLabel }}</div>
                        </div>
                        <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" @click="scope.pickFiles" round dense
                            flat>
                            Pick Files
                            <q-uploader-add-trigger />
                        </q-btn>
                        <q-btn class="q-ml-md" v-if="scope.canUpload" icon="cloud_upload" @click="scope.upload" round
                            dense flat>

                            Upload Files
                        </q-btn>

                        <q-btn v-if="scope.isUploading" icon="clear" @click="scope.abort" round dense flat>
                            Abort Upload
                        </q-btn>
                    </div>
                </template>
            </q-uploader>
            <!-- <button type="submit">Upload</button> -->
        </form>
    </div>
    <div>
        <q-dialog v-model="dialogEnable" :persistent="dialogPersistentIsEnabled" backdrop-filter="blur(4px)"
            ref="dialogRef">
            <q-card-section class="column items-center 
            q-pb-none text-h6 dialog ">

                <q-avatar :icon="dialogHeader == 'Sucessful' ? 'error' : 'done'" color="primary" text-color="white"
                    class="" />

                <h3>{{ dialogHeader }}</h3>
                <p>{{ dialogMessage }}
                </p>
                <q-btn label="Ok" color="primary" v-close-popup autofocus />
            </q-card-section>

        </q-dialog>
    </div>
</template>
<style>
@import '../../public/css/dialog.css';
@import '../../public/css/main-content-variants.css';

.instructions {
    margin-bottom: 5%;
}

h1 {
    text-align: center;
}

.fu {
    width: 100% !important;
}

label {
    text-transform: unset !important;
}
</style>
<script setup lang='ts'>
import * as xlsx from 'xlsx'
import { ref } from 'vue';
import { QUploader, QDialog } from 'quasar';
import { libraryAndArchiveHeader, negativeHeaders, oralHistoryHeaders, printHeaders, slideHeaders } from '../constants';
const dialogHeader = ref("")
const dialogMessage = ref("");
const fileUploaderRef = ref();
const dialogEnable = ref(false)
const dialogPersistentIsEnabled = ref(false)
const url_ = ref(`${import.meta.env.VITE_API_URL}/uploadFiles/?user_id=${localStorage.getItem('user_id')}`);
const formFields = ref(
    [{ name: 'user_id', value: localStorage.getItem("user_id")! }]
)
const onAddedListener = (files: readonly File[]) => {
    const names_of_files_with_headers_only: string[] = []
    const names_of_files_with_zero_bytes: string[] = []
    const names_of_files_with_incorrect_headers: string[] = []
    const x = files.map((file: any) => {
        return new Promise<void>((resolve) => {
            if (file.size == 0) {
                names_of_files_with_zero_bytes.push(file.name)
                fileUploaderRef.value.files.splice(fileUploaderRef.value.files.indexOf(file), 1)
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
                    const headersString: string = Object.values(headers).map(col => col.trim().toLocaleLowerCase()).toString().replace(",,", ",")
                    if (headersString != printHeaders
                        && headersString != negativeHeaders
                        && headersString != slideHeaders
                        && headersString != libraryAndArchiveHeader
                        && headersString != oralHistoryHeaders
                    ) {
                        fileUploaderRef.value.files.splice(fileUploaderRef.value.files.indexOf(file), 1)
                        names_of_files_with_incorrect_headers.push(file.name)
                    }

                    const isInvalidContent = (content == null) ? true : (content.trim() == "" || !content.includes(",")) ? true : false

                    if (isInvalidContent) {
                        fileUploaderRef.value.files.splice(fileUploaderRef.value.files.indexOf(file), 1)
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
                        .map(col => col.trim().toLocaleLowerCase()).toString().replace(",,", ",")
                    if (headersString != printHeaders
                        && headersString != negativeHeaders
                        && headersString != slideHeaders
                        && headersString != libraryAndArchiveHeader
                        && headersString != oralHistoryHeaders
                    ) {
                        fileUploaderRef.value.files.splice(fileUploaderRef.value.files.indexOf(file), 1)
                        names_of_files_with_incorrect_headers.push(file.name)
                    }
                    const content = csv.split('\n').slice(2)
                    if (content.length == 1 || content[0]?.trim() == "" || !content.includes(',')) {
                        fileUploaderRef.value.removeFile(file)
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
            dialogHeader.value = "Error"
            dialogMessage.value = errorMessage + "All of these file(s) will not be selected."
            dialogEnable.value = true
        }

    })

}
const onUploadedListener = (info: { files: readonly any[]; xhr: XMLHttpRequest; }) => {
    dialogHeader.value = "Successful"
    dialogMessage.value = "sucessfully uploaded file(s)"
    dialogPersistentIsEnabled.value = false
    dialogEnable.value = true

    fileUploaderRef.value.reset()

}

const onFailedListener = (info: { files: readonly any[]; xhr: XMLHttpRequest; }) => {
    // this listener calls out even when there is not Failure of upload so i have to check:
    if (info.xhr.status == 0)
        return

    dialogHeader.value = "Error: Upload Failed"
    dialogMessage.value = JSON.parse(info.xhr.response).detail
    dialogPersistentIsEnabled.value = true
    dialogEnable.value = true

    fileUploaderRef.value.reset()
}
const submit = () => {
    // event.preventDefault()
}
</script>