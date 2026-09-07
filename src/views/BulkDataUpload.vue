<template>
    <div class="medium common">
        <form>
            <div class="">
                <h3>Bulk Data Upload</h3>
                <p>Entries with existing data (As identified by each catalogry's first column, where the name is usually
                    with SN in it.) will be overwritten. <br>
                    Only csv and single sheet xlsx are accepted.</p>
            </div>
            <q-uploader class="fu " multiple persistent accept=".csv,.xlsx" @added="onAddedListener"
                ref="fileUploaderRef" :url="url_" field-name="files" method="POST" @uploaded="onUploadedListener"
                @failed="onFailedListener" color="grey-9" batch>

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
                            <div class="q-uploader__title">Click or Drag and Drop files here.</div>
                            <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }} /
                                {{ scope.uploadProgressLabel }}</div>
                        </div>
                        <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" @click="scope.pickFiles" round dense
                            flat :disable="isCheckingFilesValidity">
                            Pick File(s)
                            <q-uploader-add-trigger />
                        </q-btn>
                        <q-btn class="q-ml-md" v-if="scope.canUpload && scope.queuedFiles.length > 0"
                            :disable="isCheckingFilesValidity" icon="cloud_upload" @click="scope.upload" round dense
                            flat>
                            Upload File(s)
                        </q-btn>

                        <q-btn v-if="scope.isUploading" icon="clear" @click="scope.abort" round dense flat>
                            Abort Upload
                        </q-btn>
                    </div>
                </template>

                <template v-if="isCheckingFilesValidity" v-slot:list="scope">
                    Checking headers validity
                </template>
            </q-uploader>

            <q-btn class="button float-left" @click.prevent="downloadTemplatesForTheCatalogs">
                <i class="fas fa-file-arrow-down"></i>
                Download Templates</q-btn>
        </form>
    </div>
    <div>
        <q-dialog v-model="dialogEnable" :persistent="dialogPersistentIsEnabled" backdrop-filter="blur(4px)"
            ref="dialogRef">
            <q-card class="dialog">
                <q-card-section>
                    <q-avatar :icon="dialogHeader == 'Sucessful' ? 'done' : 'error'" color="primary" text-color="white"
                        class="" />
                </q-card-section>

                <h3>{{ dialogHeader }}</h3>

                <p v-if="dialogHeader.toLocaleLowerCase() == 'successful'">Sucessfully uploaded files</p>
                <p>{{ dialogHeader.toLocaleLowerCase() == 'error'
                    && names_of_files_with_headers_only.length != 0 ?
                    "Files with headers only: " +
                    names_of_files_with_headers_only.join(",")
                    : '' }}</p>
                <p>{{ dialogHeader.toLocaleLowerCase() == 'error'
                    && names_of_files_with_incorrect_headers.length != 0 ?
                    "Files with incorrect header: " +
                    names_of_files_with_incorrect_headers.join(",")
                    : '' }}</p>
                <p> {{ dialogHeader.toLocaleLowerCase() == 'error'
                    && names_of_files_with_zero_bytes.length != 0
                    ? "Empty files: " +
                    names_of_files_with_zero_bytes.join(",")
                    : ''
                    }}</p>
                <p>
                    {{ dialogHeader.toLocaleLowerCase() == 'error'
                        ? "These files will be removed"
                        : '' }}
                </p>

                <q-btn label="Ok" color="primary" v-close-popup autofocus />

            </q-card>
        </q-dialog>
    </div>
</template>
<style>
@import '../../public/css/dialog.css';
@import '../../public/css/main-content-variants.css';

.fu {
    margin-top: 2%;
    margin-bottom: 2%;
    width: 100% !important;
    height: 100%;
}
</style>
<script setup lang='ts'>
import { ref, type Ref } from 'vue';
import { QUploader, QDialog } from 'quasar';

import { getTemplates } from '../helpers/fetch-wrapper';
import { useAuthStore } from '../stores/auth.store';

const dialogHeader = ref("")
const dialogMessage = ref("");
const dialogEnable = ref(false)
const dialogPersistentIsEnabled = ref(false)
const fileUploaderRef = ref()
const url_ = ref(`${import.meta.env.VITE_API_URL}/UploadFiles/?user_id=${useAuthStore().user.user_id}`);
const isCheckingFilesValidity = ref(false)
let names_of_files_with_headers_only: Ref<string[]> = ref([])
const names_of_files_with_zero_bytes: Ref<string[]> = ref([])
let names_of_files_with_incorrect_headers: Ref<string[]> = ref([])



async function downloadTemplatesForTheCatalogs() {
    const url = `${import.meta.env.VITE_API_URL}/DownloadTemplatesForTheCatalogs/`;
    getTemplates(url).then((download) => {
        var url = window.URL.createObjectURL(download);
        var a = document.createElement('a');
        a.href = url;
        a.download = "templates for the catalogs";
        document.body.appendChild(a); // append the element to the dom
        a.click();
        a.remove(); // afterwards, remove the element 
    })
}

const onAddedListener = (files: readonly File[]) => {
    isCheckingFilesValidity.value = true
    let workersFinishedWork = []
    names_of_files_with_headers_only.value = []
    names_of_files_with_incorrect_headers.value = []
    names_of_files_with_zero_bytes.value = []
    console.log('on added listener')
    const x = files.map((file: File) => {
        return new Promise<void>((_resolve) => {
            if (file.size == 0) {
                names_of_files_with_zero_bytes.value.push(file.name)
                fileUploaderRef.value.removeFile(file)
                workersFinishedWork.push(file.name)
                return
            }
            const worker = new Worker(new URL('../helpers/fileCheckerWorker.ts', import.meta.url), {
                type: 'module'
            });
            worker.onmessage = (event) => {
                workersFinishedWork.push(file.name)
                console.log(workersFinishedWork, files.length)
                if (event.data.name_of_file_with_headers_only != '') {
                    names_of_files_with_headers_only.value.push(event.data.name_of_file_with_headers_only)
                    fileUploaderRef.value.removeFile(file)
                }
                if (event.data.name_of_file_with_incorrect_headers != '') {
                    names_of_files_with_incorrect_headers.value.push(event.data.name_of_file_with_incorrect_headers)
                    fileUploaderRef.value.removeFile(file)
                }
                if (workersFinishedWork.length == files.length) {
                    isCheckingFilesValidity.value = false
                }
                if ((names_of_files_with_headers_only.value.length > 0
                    || names_of_files_with_incorrect_headers.value.length > 0
                    || names_of_files_with_zero_bytes.value.length > 0)
                    && workersFinishedWork.length == files.length) {
                    dialogHeader.value = "Error"
                    dialogEnable.value = true
                }
            }

            worker.postMessage({ file: file })

            worker.onerror = (error) => {
                console.error('Worker error:', error);
                worker.terminate();
            }
        })
    })
    //Promise all then is very slow so I don't use it.

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

</script>