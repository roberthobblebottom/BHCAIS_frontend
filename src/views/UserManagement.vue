<template>

    <div class="q-pa-md common">
        <h3> User Management </h3>

        <div class="row justify-end q-mb-md">
            <q-btn class="button" color="blue" size='md' @click="openCreateDialog">
                <q-icon name="fa-solid fa-user-plus" size='xs' class="q-mr-sm"></q-icon>
                Create User
            </q-btn>
        </div>

        <q-table class="table-div" :wrap-cells="true" ref="tableRef" v-model:rows="rows" :columns="columns"
            :row-key="rowKey" :loading="loading">
            <template v-slot:body-cell-action="props">
                <!-- buttons for actions for each rows -->
                <q-td :props="props">
                    <div class="row justify-around">
                        <q-btn size="md" color="blue" @click="openEditDialog(props.row)">
                            <q-icon name="fa-solid fa-user-pen" size='xs' class="q-mr-sm"></q-icon>
                            Edit
                        </q-btn>
                        <q-btn size="md" color="red" @click="openConfirmDeleteDialog(props.row)">
                            <q-icon name="fa-solid fa-user-minus" size='xs' class="q-mr-sm"></q-icon>
                            Delete
                        </q-btn>
                    </div>
                </q-td>
            </template>
        </q-table>
    </div>

    <!-- Create or Edit User Dialog -->
    <q-dialog v-model="showFormDialog">
        <q-card class="dialog">
            <q-card-section class="q-pt-none ">
                <h3>{{ isEditMode ? 'Edit User' : 'Create User' }}</h3>

                <p>
                    {{ isEditMode
                        ? 'Only enter the new password if you want to change the password'
                        : 'All fields are required' }}
                </p>

                <q-form ref="userForm" validation-observer @click.prevent="isEditMode ? onEdit : onCreate">
                    <q-input label="Email" v-model="email" , v-bind="emailProps"></q-input>
                    <q-input label="Password" v-model="password" v-bind="passwordProps"
                        :type="showPassword ? 'text' : 'password'">
                        <template v-slot:append>
                            <q-icon class="cursor-pointer" :name="showPassword ? 'visibility_off' : 'visibility'"
                                @click="showPassword = !showPassword" />
                        </template>
                    </q-input>
                    <q-input label="Confirm Password" :type="showConfirmPassword ? 'text' : 'password'"
                        v-model="confirmPassword" v-bind="confirmPasswordProps">
                        <template v-slot:append>
                            <q-icon :name="showConfirmPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                @click="showConfirmPassword = !showConfirmPassword" />
                        </template>
                    </q-input>
                    <q-select label="User Type" type="dropdown" v-model="userType" v-bind="userTypeProps"
                        :options="['admin', 'normal']">
                    </q-select>

                    <div class="flex justify-around">
                        <q-btn label="Close" color="secondary" size="md" flat v-close-popup />
                        <q-btn size="md" color="primary" :disable='isEditOrCreateInProgress'
                            @click="isEditMode ? onEdit() : onCreate()">
                            <q-icon size='xs' class="q-mr-sm" :name="isEditOrCreateInProgress
                                ? 'fa-solid fa-spinner fa-spin-pulse'
                                : 'fa-regular fa-pen-to-square'"></q-icon>
                            {{ isEditMode ? 'Edit ' : 'Create ' }}
                        </q-btn>
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>

    <!-- delete confirmation dialog or Error dialog or sucess dialog-->
    <q-dialog v-model="showAlertDialog">
        <q-card class="column  items-center  justify-center
            q-pb-none  dialog">
            <q-card-section class="justify-center items-center column q-pb-none">
                <q-avatar v-if="showDeleteConfirmationConfig" icon="help_outline" color="primary" text-color="white" />
                <q-avatar v-else icon="error" color="primary" text-color="white" />

                <div class="q-mt-md"> {{ alertDialogMessage }}</div>

                <div v-if="showDeleteConfirmationConfig" class="delete-confirmation row justify-evenly q-mt-md">
                    <q-btn flat label="Cancel" color="secondary" size="md" v-close-popup />
                    <q-btn size="md" color="primary" :disable="isDeleteInProgress" @click="onDelete(userIdToBeDeleted)">
                        <q-icon :class="isDeleteInProgress
                            ? 'fa-solid fa-spinner fa-spin-pulse'
                            : 'fa-regular fa-pen-to-square'" class="q-mr-sm" size='xs'></q-icon>
                        Delete
                    </q-btn>
                </div>
                <q-btn v-else class="q-mt-md" label="Ok" color="primary" autofocus v-close-popup />
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

.button {
    min-width: 100px !important;
}
</style>

<script setup lang="ts">
import { QForm, QTr } from 'quasar'
import { onBeforeMount, ref, type MaybeRefOrGetter, type Ref } from 'vue'
import { fetchWrapper, noCacheRequestFetch, } from '../helpers/fetch-wrapper'
import { useForm } from 'vee-validate'
import { passwordRegex, passwordError } from '../constants'
import { QBtn } from 'quasar'
import * as yup from 'yup'
import commonPasswords from '../common-passwords.txt?raw'

QBtn.props.noCaps = { type: Boolean, default: true }

/**
 * Table refs
 */
const columns: Ref<any[]> = ref([])
const rows: Ref<QTr[]> = ref([])
const rowKey = ref('user_id')
const loading = ref(false)

/**
 * Dialog refs
 */
const showFormDialog = ref(false)
const showAlertDialog = ref(false)
const showDeleteConfirmationConfig = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const alertDialogMessage = ref("")

const userIdToBeDeleted = ref(-1)
const isDeleteInProgress = ref(false)

const isEditOrCreateInProgress = ref(false)


let oldUserIDBeforeEdit: number | null = null

const schema = yup.object().shape({
    isEditMode: yup.boolean(),
    email: yup.string().email().required("Email  is required"),
    password: yup.string().when(
        "isEditMode", {
        is: true,

        //In Edit Mode
        then: (schema) => {
            const c = commonPasswords.split("\n")
            c.splice(c.indexOf(""))
            return schema.when("password", {
                is: (value: string) => value && value.length > 0,
                then: (s) => s.min(7, 'Minimum of 7 characters for password   ')
                    .matches(passwordRegex, passwordError)
                    .notOneOf(c, "The password is too common"),
                otherwise: (s) => s.notRequired() // validation not required if not password is entered
            })
        },

        //In Create Mode
        otherwise: (schema) => schema.min(7, 'Minimum of 7 characters for password   ')
            .matches(passwordRegex, passwordError)
            .notOneOf(commonPasswords.split("\n"), "The password is too common")
    }),
    confirmPassword: yup.string().oneOf([yup.ref('password'), ""], "Passwords must match."),
    userType: yup.string().oneOf(['normal', 'admin']).required("User type is required")
})

const { defineField, handleSubmit, resetForm } = useForm({
    validationSchema: schema,
    initialValues: { terms: false },
})

const quasarConfig = (state: any) => ({
    props: {
        error: !!state.errors[0],
        'error-message': state.errors[0],
    },
})

const [email, emailProps] = defineField("email" as MaybeRefOrGetter, quasarConfig)
const [password, passwordProps] = defineField("password" as MaybeRefOrGetter, quasarConfig)
const [confirmPassword, confirmPasswordProps] = defineField("confirmPassword" as MaybeRefOrGetter, quasarConfig)
const [userType, userTypeProps] = defineField("userType" as MaybeRefOrGetter, quasarConfig)
const [isEditMode, _isEditModeProps] = defineField("isEditMode" as MaybeRefOrGetter, quasarConfig)

const getAllUsers = async () => {
    const url = `${import.meta.env.VITE_API_URL}/GetAllUsers/`
    const response = await noCacheRequestFetch(url, 'get')

    const results = response.results
    const temp: any = []

    rows.value = results

    //for each column, do some config
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

    //action button column! 
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

onBeforeMount(async () => await getAllUsers())

function openCreateDialog() {
    resetForm()

    showDeleteConfirmationConfig.value = false
    showFormDialog.value = true

    isEditMode.value = false
}

function openEditDialog(user: any) {
    resetForm()

    showDeleteConfirmationConfig.value = false
    showFormDialog.value = true

    isEditMode.value = true

    //filling up form with existing data
    //Except for passwords of course.
    email.value = user.email
    userType.value = user.user_type

    oldUserIDBeforeEdit = user.user_id
}

function openConfirmDeleteDialog(user: any) {
    showAlertDialog.value = true
    showDeleteConfirmationConfig.value = true
    alertDialogMessage.value = "Are you sure you want to delete this user? " + user.email
    userIdToBeDeleted.value = user.user_id
}



const onCreate = handleSubmit(async () => {
    /**
         * Create User function with packet of user details 
         * to be created to be sent to the server
         */

    isEditMode.value = false
    isEditOrCreateInProgress.value = true

    const url = `${import.meta.env.VITE_API_URL}/CreateUser/`
    await fetchWrapper.post(url, {
        email: email.value,
        password: password.value,
        confirm_password: confirmPassword.value,
        user_type: userType.value,
    }).finally(() => {
        //show creation of user success dialog 
        showAlertDialog.value = true
        alertDialogMessage.value = "Sucessfully created user"
        showFormDialog.value = false
        isEditOrCreateInProgress.value = false
    })


    const temp: any[] = rows.value
    temp.push({
        user_id: parseInt(temp[temp.length - 1].user_id) + 1,
        email: email.value,
        user_type: userType.value
    })
    rows.value = temp
    resetForm()
})

const onEdit = handleSubmit(async () => {
    /**
         * Edit User function with packet of user details 
         * to be edited to be sent to the server
         */

    isEditMode.value = false
    isEditOrCreateInProgress.value = true

    const url = `${import.meta.env.VITE_API_URL}/EditUser/`
    const body = {
        user_id: oldUserIDBeforeEdit,
        email: email.value,
        password: (password.value == null || password.value == "") ? "" : password.value,
        confirm_password: (confirmPassword.value == null || confirmPassword.value == "") ? "" : confirmPassword.value,
        user_type: userType.value,
    }
    await fetchWrapper.put(url, body).finally(() => {
        showAlertDialog.value = true
        alertDialogMessage.value = "Sucessfully edited user"
        showFormDialog.value = false
        isEditOrCreateInProgress.value = false
    })

    // let temp: UserInterface[] = rows.value.map((value: QTr, index: number, array: QTr[]) => {
    //     return value.$data
    // }) as UserInterface[]
    await getAllUsers() // less efficient than directly putting it into the table but this works.

    //I don't know how to do these:
    // ('temp', temp)
    // temp = temp.slice(temp.indexOf(oldUserValuesBeforeEdit!), 1)
    // ('temp', temp)
    // temp.push({ user_id: parseInt(temp[temp.length - 1].user_id) + 1, email: email.value, user_type: userType.value })
    // rows.value = temp as QTr[]

    oldUserIDBeforeEdit = null
    resetForm()
})

async function onDelete(user_id: number) {
    /**
     * Delete User function with packet of user details 
     * to be delete to be sent to the server
     */

    isDeleteInProgress.value = true

    const url = `${import.meta.env.VITE_API_URL}/DeleteUser/`
    const body = { user_id: user_id }

    await fetchWrapper.delete(url, body).finally(() => {
        isDeleteInProgress.value = false

        showAlertDialog.value = true
        alertDialogMessage.value = "Sucessfully Deleted user"
        showDeleteConfirmationConfig.value = false
    })

    await getAllUsers() // less efficient than directly putting it into the table but this works.
}

</script>