<template>

    <div class="q-pa-md large common">
        <h1>

            View Users
        </h1>
        <div class="row items-right">
            <button class="button" @click="openCreateDialog">Create User</button>
        </div>
        <q-table class="table-div" v-model:rows="rows" :columns="columns" :row-key="rowKey" ref="tableRef"
            :loading="loading" :wrap-cells="true">

        </q-table>
    </div>


    <q-dialog v-model="showFormDialog">
        <q-card class="dialog">
            <q-card-section class="q-pt-none ">
                <h3>{{ isEdit ? 'Edit User' : 'Create User' }}</h3>
                <p>
                    {{ isEdit ? 'Only enter your new password if you want to change the password'
                        : 'All fields are required' }}
                </p>
                <q-form ref="userForm" validation-observer @click.prevent="isEdit ? onEdit : onCreate">
                    <q-input label="email" v-model="email" , v-bind="emailProps"></q-input>
                    <q-input label="Password" v-model="password" v-bind="passwordProps"
                        :type="showPassword ? 'text' : 'password'">
                        <template v-slot:append>
                            <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                @click="showPassword = !showPassword" />
                        </template>

                    </q-input>

                    <q-input :type="showConfirmPassword ? 'text' : 'password'" label="Confirm Password"
                        v-model="confirmPassword" v-bind="confirmPasswordProps">
                        <template v-slot:append>
                            <q-icon :name="showConfirmPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                @click="showConfirmPassword = !showConfirmPassword" />
                        </template>
                    </q-input>
                    <q-select label="User Type" type="dropdown" v-model="userType" v-bind="userTypeProps"
                        :options="['admin', 'normal']">
                    </q-select>
                    <q-btn flat label="close" color="secondary" v-close-popup />
                    <q-btn :label="isEdit ? 'edit' : 'create'" color="primary"
                        @click="isEdit ? onEdit() : onCreate()" />
                </q-form>
            </q-card-section>

        </q-card>
    </q-dialog>
    <q-dialog v-model="showAlertDialog">

        <q-card class="column items-center 
            q-pb-none text-h6 dialog ">

            <q-card-section class="  items-center column q-pb-none">
                <q-avatar icon="error" color="primary" text-color="white" class="" />
                {{ alertDialogMessage }}

                <q-btn label="Ok" color="primary" v-close-popup autofocus />
            </q-card-section>

        </q-card>

    </q-dialog>
</template>
<style lang="css" scoped>
@import '../../public/css/dialog.css';
</style>
<script setup lang="ts">
import { QForm, type QTr } from 'quasar';
import { onBeforeMount, ref, type MaybeRefOrGetter, type Ref, nextTick } from 'vue';
import { fetchWrapper } from '../helpers/fetch-wrapper';
import { useField, useForm, type BaseFieldProps } from 'vee-validate';

import * as yup from 'yup';
import { passwordRegex, passwordError } from '../constants';

import commonPasswords from '../common-passwords.txt?raw'
const columns: Ref<any[]> = ref([])
const rows: Ref<QTr[]> = ref([])
const rowKey = ref('user_id')
const loading = ref(false)

const userForm: Ref<QForm | null> = ref(null)
const showFormDialog = ref(false)
const showAlertDialog = ref(false)
const isEdit = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const alertDialogMessage = ref("")

const schema = yup.object().shape({
    email: yup.string().email().required("email  is required"),
    password: yup.string()
        .min(7, 'minimum of 7 characters for password   ')
        .matches(passwordRegex, passwordError)
        // ,
        .notOneOf(commonPasswords.split("\n"), "The password is too common"),
    confirmPassword: yup.string().oneOf([yup.ref('password'), ""], "Passwords must match."),
    userType: yup.string().oneOf(['normal', 'admin']).required("User typer is required")
});
const { defineField, handleSubmit, resetForm } = useForm({
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



const [email, emailProps] = defineField("email" as MaybeRefOrGetter, quasarConfig)
const [password, passwordProps] = defineField("password" as MaybeRefOrGetter, quasarConfig)
const [confirmPassword, confirmPasswordProps] = defineField("confirmPassword" as MaybeRefOrGetter, quasarConfig)
const [userType, userTypeProps] = defineField("userType" as MaybeRefOrGetter, quasarConfig)
const getData = async () => {
    const url = `${import.meta.env.VITE_API_URL}/GetAllUsers/`
    const response = await fetchWrapper.get(url)

    const results = response.results
    rows.value = results
    const temp: any = []
    for (const h of Object.keys(results[0])) {
        temp.push({
            name: h,
            required: false,
            label: h,
            align: 'left',
            field: (row: any) => row[h],
            format: (val: any) => val == null ? "" : val,
            sortable: true
        })
    }

    columns.value = temp
}

onBeforeMount(getData)

function openCreateDialog() {
    showFormDialog.value = true
    isEdit.value = false
    resetForm()
}



const onCreate = handleSubmit(async (values) => {
    isEdit.value = false
    showFormDialog.value = false
    console.log('in onCreate')

    const url = `${import.meta.env.VITE_API_URL}/CreateUser/`
    try {
        const response = await fetchWrapper.post(url, {
            email: email.value,
            password: password.value,
            confirm_password: confirmPassword.value,
            user_type: userType.value,
        })
        console.log('response', response)

        showAlertDialog.value = true
        alertDialogMessage.value = "Sucessfully created user"
        getData()

    } catch (err: any) {
        showAlertDialog.value = true
        alertDialogMessage.value = "Error in Creating User: " + err
    }

})
const onEdit = handleSubmit(async (values) => {
    isEdit.value = false
    showFormDialog.value = false
    console.log('in onEdit')
})
</script>