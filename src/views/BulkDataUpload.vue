<template>
    <div>
        <Form @submit="onSubmit" v-slot="{ errors, isSubmitting }">

            <div class="form-group">

                <h2>Bulk Data Upload</h2>
                <FileUpload custom-upload @select="onUploadFileSelection($event)" :multiple="true" accept=".csv,.xlsx"
                    name="file-upload" url="/upload">
                    <p>Drag and drop files to here to upload or click to select multiple files here
                        Entries with existing data will be overwritten.
                        csv and single sheet xlsx Only </p>
                </FileUpload>
                <button class="btn btn-primary" :disabled="isSubmitting">
                    <span v-show="isSubmitting" class="spinner-border 
                    spinner-border-sm mr-1"></span>
                    Upload
                </button>
            </div>
            <div v-if="errors.apiError" class="alert alert-danger mt-3 mb-0">{{ errors.apiError }}</div>
        </Form>
    </div>
</template>
<script setup lang='ts'>
import { Form, Field, type FormActions, type GenericObject } from 'vee-validate';
import * as Yup from 'yup';
import { useAuthStore } from '../stores/auth.store.ts';
import FileUpload, { type FileUploadBeforeSendEvent, type FileUploadSelectEvent } from 'primevue/fileupload';
import * as xlsx from 'xlsx'
// const schema = Yup.object().shape({
//     username: Yup.string().required('Username is required'),
//     password: Yup.string().required('Password is required')
// });
import { useToast } from "primevue/usetoast";
import { fetchWrapper } from '../helpers/fetch-wrapper.ts';
function onSubmit(values: GenericObject, { setErrors }: FormActions<GenericObject>) {
    console.log('on submit')
    console.log('values', values)
    // fetchWrapper.post("", '')
}

const onUploadFileSelection = (event: FileUploadSelectEvent): void => {
    console.log('before upload')
    // console.log(event.files)

    event.files.forEach((file: any) => {
        console.log(file)
            const reader = new FileReader()
        if (file.name.includes('.xlsx')) {
            console.log('123')
            reader.onload = (e: ProgressEvent<FileReader>) => {

                try {
                    // Read the file as an array buffer
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    
                    // Parse the workbook
                    const workbook = xlsx.read(data, { type: 'array', sheetRows: 1 });

                    // Get the first sheet
                    const sheetName = workbook.SheetNames[0]!;
                    const worksheet: any = workbook.Sheets[sheetName];

                    // Extract headers (first row)
                    const headers = xlsx.utils.sheet_to_json(worksheet, {
                        header: 1
                    })[0] as string[];

                    console.log(`Headers from ${file.name}:`, headers);
                }
                catch (error) {
                    console.error('error reading file', error)
                }
            }
            reader.readAsArrayBuffer(file)
        }
        else if (file.name.includes('.csv')) {
            //TODO: check header
             reader.onload = (e: ProgressEvent<FileReader>) => {

                try {
                    // Read the file as an array buffer
                   
                    const csv = e.target?.result as string
                    const headers =  csv.split('\n')[0]
                    console.log(`Headers from ${file.name}:`, headers);
                }
                catch (error) {
                    console.error('error reading file', error)
                }
            }
            reader.readAsText(file)
        }
        // const workbookHeaders = xlsx.readFile(x.name, { sheetRows: 1 });
        // console.log(workbookHeaders.Sheets)
        // const columnsArray = xlsx.utils.sheet_to_json(workbookHeaders.Sheets[sheetName]!, { header: 1 })[0];
    })
    // event.formData.forEach((value,key,parent)=>{
    //     console.log(key,value)
    // })
}

// const toast = useToast();

// const onAdvancedUpload = () => {
//     toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
// };
</script>