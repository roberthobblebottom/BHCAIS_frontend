<template>

    <div class="q-pa-md large common">
        <h3>

            User Management
        </h3>
        <div class="row justify-end q-mb-md">
            <button class="button" @click="openCreateDialog">Create User</button>
        </div>
        <q-table class="table-div" v-model:rows="rows" :columns="columns" :row-key="rowKey" ref="tableRef"
            :loading="loading" :wrap-cells="true">
            <template v-slot:body-cell-action="props">
                <q-td :props="props">
                    <div class="row justify-around">
                        <q-btn color="blue" @click="openEditDialog(props.row)" label="Edit"></q-btn>
                        <q-btn color="red" @click="openConfirmDeleteDialog(props.row)" label="Delete"></q-btn>
                    </div>

                </q-td>
            </template>
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
                <q-avatar v-if="isDeleteConfirmationDialog" icon="help_outline" color="primary" text-color="white"
                    class="" />
                <q-avatar v-else icon="error" color="primary" text-color="white" class="" />
                {{ alertDialogMessage }}
                <div class="delete-confirmation row justify-evenly" v-if="isDeleteConfirmationDialog">
                    <q-btn label="Cancel" color="secondary" v-close-popup />
                    <q-btn label="Delete" color="primary" />

                </div>
                <q-btn v-else label="Ok" color="primary" v-close-popup autofocus />
            </q-card-section>

        </q-card>

    </q-dialog>
</template>
<style lang="css" scoped>
@import '../../public/css/dialog.css';
@import '../../public/css/main-content-variants.css';

.delete-confirmation {
    width: 100%;
}
</style>
<script setup lang="ts">
import { QForm, QTr } from 'quasar';
import { nextTick, onBeforeMount, ref, type MaybeRefOrGetter, type Ref } from 'vue';
import { fetchWrapper, noCacheRequestFunction, } from '../helpers/fetch-wrapper';
import { useForm } from 'vee-validate';

import * as yup from 'yup';
import { passwordRegex, passwordError } from '../constants';

import commonPasswords from '../common-passwords.txt?raw'
const columns: Ref<any[]> = ref([])
const rows: Ref<QTr[]> = ref([])
const rowKey = ref('user_id')
const loading = ref(false)

const showFormDialog = ref(false)
const showAlertDialog = ref(false)
const isEdit = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const alertDialogMessage = ref("")
const isDeleteConfirmationDialog = ref(false)
interface UserInterface {
    user_id: number
    email: number
    password: string
    confirm_password: string
    user_type: string
}

let oldUserValuesBeforeEdit: UserInterface | null = null
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
    // const header = { "Cached-Content": "no-cache" }
    const response = await noCacheRequestFunction(url, 'get')

    const results = response.results
    rows.value = results
    const temp: any = []
    for (const h of Object.keys(results[0])) {
        temp.push({
            name: h,
            required: false,
            label: h.replaceAll("_", " "),
            align: 'left',
            field: (row: any) => row[h],
            format: (val: any) => val == null ? "" : val,
            sortable: true
        })
    }
    temp.push({
        name: "action",
        required: false,
        label: "action",
        align: 'left',
        field: (row: any) => row["action"],
        format: (val: any) => val == null ? "" : val,
        sortable: true
    })
    columns.value = temp
}

onBeforeMount(async () => await getData())


function openCreateDialog() {
    resetForm()
    isDeleteConfirmationDialog.value = false
    showFormDialog.value = true
    isEdit.value = false
}

function openEditDialog(user: any) {
    resetForm()
    isDeleteConfirmationDialog.value = false
    isEdit.value = true
    email.value = user.email
    userType.value = user.user_type
    oldUserValuesBeforeEdit = user
    showFormDialog.value = true
}
function openConfirmDeleteDialog(user: any) {
    isDeleteConfirmationDialog.value = true
    showAlertDialog.value = true
    alertDialogMessage.value = "are you sure you want to delete this user? " + user.email
}



const onCreate = handleSubmit(async () => {
    isEdit.value = false
    showFormDialog.value = false

    const url = `${import.meta.env.VITE_API_URL}/CreateUser/`
    try {
        await fetchWrapper.post(url, {
            email: email.value,
            password: password.value,
            confirm_password: confirmPassword.value,
            user_type: userType.value,
        })

        showAlertDialog.value = true
        alertDialogMessage.value = "Sucessfully created user"

        const temp: any[] = rows.value
        temp.push({ user_id: parseInt(temp[temp.length - 1].user_id) + 1, email: email.value, user_type: userType.value })
        rows.value = temp
        resetForm()

    } catch (err: any) {
        showAlertDialog.value = true
        alertDialogMessage.value = "Error in Creating User: " + err
    }

})
const onEdit = handleSubmit(async () => {
    isEdit.value = false
    showFormDialog.value = false

    const url = `${import.meta.env.VITE_API_URL}/EditUser/`
    try {
        const body = {
            user_id: oldUserValuesBeforeEdit!.user_id,
            email: email.value,
            password: password.value == null ? "" : password.value,
            confirm_password: confirmPassword.value == null ? "" : confirmPassword.value,
            user_type: userType.value,
        }

        await fetchWrapper.post(url, body)

        showAlertDialog.value = true
        alertDialogMessage.value = "Sucessfully edited user"

        // let temp: UserInterface[] = rows.value.map((value: QTr, index: number, array: QTr[]) => {
        //     return value.$data
        // }) as UserInterface[]
        await getData() // less efficient than directly putting it into the table but this works.

        //I don't know how to do these:
        // console.log('temp', temp)
        // temp = temp.slice(temp.indexOf(oldUserValuesBeforeEdit!), 1)
        // console.log('temp', temp)
        // temp.push({ user_id: parseInt(temp[temp.length - 1].user_id) + 1, email: email.value, user_type: userType.value })
        // rows.value = temp as QTr[]
        oldUserValuesBeforeEdit = null
        resetForm()

    } catch (err: any) {
        showAlertDialog.value = true
        alertDialogMessage.value = "Error in Creating User: " + err
    }
})
</script>